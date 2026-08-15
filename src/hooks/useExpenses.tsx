'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSession } from '../context/SessionProvider';
import {
  createBudgetPeriod,
  deleteExpense,
  getBudgetPeriods,
  getExpenses,
  newExpenseId,
  updateBudgetPeriod,
} from '../services/expenseService';
import { enqueue, dequeue, flushQueue, readQueue } from '../lib/offlineQueue';
import { readScoped, writeScoped } from '../lib/userStorage';
import { expenseTitle, type Expense, type ExpenseCategory, type NewExpense } from '../types/expense';
import type { BudgetPeriod, NewBudgetPeriod } from '../types/budget';
import {
  computeAllowance,
  findCurrentPeriod,
  findLastEndedPeriod,
  todayISO,
  type Allowance,
  type AlertDismissal,
  type BudgetTone,
} from '../utils/allowance';

type ExpenseStore = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;

  /** Today's date as YYYY-MM-DD, kept live so the app rolls over at midnight */
  today: string;
  isOnline: boolean;
  pendingCount: number;

  periods: BudgetPeriod[];
  currentPeriod: BudgetPeriod | null;
  lastEndedPeriod: BudgetPeriod | null;
  allowance: Allowance | null;

  lastCategory: ExpenseCategory;

  /** The last budget alert waved away, so it can stay quiet for the rest of the day */
  alertDismissal: AlertDismissal | null;
  dismissAlert: (tone: BudgetTone) => void;

  refresh: () => Promise<void>;
  add: (expense: NewExpense) => Promise<void>;
  remove: (id: string) => Promise<void>;
  startPeriod: (period: NewBudgetPeriod) => Promise<void>;
  editPeriod: (
    id: string,
    patch: Partial<Pick<BudgetPeriod, 'amount' | 'start_date' | 'end_date' | 'stashed'>>
  ) => Promise<void>;
  stash: (amount: number) => Promise<void>;

  exportCSV: (rows?: Expense[]) => void;
  exportPDF: (rows?: Expense[]) => void;
};

const ExpenseContext = createContext<ExpenseStore | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const store = useExpenseData();
  return <ExpenseContext.Provider value={store}>{children}</ExpenseContext.Provider>;
}

export function useExpenseStore() {
  const store = useContext(ExpenseContext);
  if (!store) throw new Error('useExpenseStore must be used inside ExpenseProvider.');
  return store;
}

function useExpenseData(): ExpenseStore {
  const { userId, ready: sessionReady } = useSession();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [periods, setPeriods] = useState<BudgetPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [lastCategory, setLastCategory] = useState<ExpenseCategory>('Food');
  const [alertDismissal, setAlertDismissal] = useState<AlertDismissal | null>(null);
  const [today, setToday] = useState<string>(() => todayISO());

  /* ---------------------------------------------------------------------- */
  /* Midnight rollover                                                       */
  /* ---------------------------------------------------------------------- */
  /*
   * "Left today" has to become tomorrow's number without a reload -- phones sit
   * on this screen overnight. Cheaper and more reliable than scheduling a timer
   * for exactly 00:00, which drifts when the device sleeps.
   */
  useEffect(() => {
    const tick = () => setToday((previous) => (previous === todayISO() ? previous : todayISO()));
    const interval = window.setInterval(tick, 60_000);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Queue syncing                                                           */
  /* ---------------------------------------------------------------------- */

  const syncQueue = useCallback(async () => {
    if (!userId) return;
    const result = await flushQueue(userId);

    if (result.synced.length > 0) {
      const confirmed = new Map(result.synced.map((exp) => [exp.id, exp]));
      setExpenses((current) => current.map((exp) => confirmed.get(exp.id) ?? exp));
    }

    if (result.rejected.length > 0) {
      const dropped = new Set(result.rejected);
      setExpenses((current) => current.filter((exp) => !dropped.has(exp.id)));
      setError('Some offline expenses were rejected by the server and have been removed.');
    }

    setPendingCount(result.remaining);
  }, [userId]);

  useEffect(() => {
    if (typeof navigator !== 'undefined') setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      void syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                 */
  /* ---------------------------------------------------------------------- */

  const queuedAsOptimistic = useCallback(
    (owner: string, alreadySaved: Expense[]): Expense[] => {
      const savedIds = new Set(alreadySaved.map((exp) => exp.id));
      return readQueue(owner)
        .filter((item) => !savedIds.has(item.id))
        .map((item) => ({
          id: item.id,
          user_id: owner,
          date: item.date,
          category: item.category,
          description: item.description,
          amount: item.amount,
          type: item.type,
          created_at: item.queued_at,
          pending: true,
        }));
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!userId) {
      setExpenses([]);
      setPeriods([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Push local writes before pulling, so the server response is not missing
      // rows this device already knows about.
      await syncQueue();

      const [serverExpenses, serverPeriods] = await Promise.all([getExpenses(), getBudgetPeriods()]);

      setExpenses([...queuedAsOptimistic(userId, serverExpenses), ...serverExpenses]);
      setPeriods(serverPeriods);
      writeScoped(userId, 'expenses', serverExpenses);
      writeScoped(userId, 'periods', serverPeriods);
      setError(null);
    } catch (cause) {
      // Offline or the request failed: show the last known good data rather than
      // an empty screen, and say so.
      const cachedExpenses = readScoped<Expense[]>(userId, 'expenses', []);
      const cachedPeriods = readScoped<BudgetPeriod[]>(userId, 'periods', []);
      if (cachedExpenses.length > 0 || cachedPeriods.length > 0) {
        setExpenses([...queuedAsOptimistic(userId, cachedExpenses), ...cachedExpenses]);
        setPeriods(cachedPeriods);
        setError('Showing saved data — could not reach the server.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Unable to load your expenses.');
      }
    } finally {
      setLoading(false);
      setPendingCount(readQueue(userId).length);
    }
  }, [userId, syncQueue, queuedAsOptimistic]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!userId) {
      setExpenses([]);
      setPeriods([]);
      setLoading(false);
      setPendingCount(0);
      return;
    }
    setLastCategory(readScoped<ExpenseCategory>(userId, 'last-category', 'Food'));
    setAlertDismissal(readScoped<AlertDismissal | null>(userId, 'alert-dismissal', null));
    void refresh();
  }, [sessionReady, userId, refresh]);

  /* ---------------------------------------------------------------------- */
  /* Mutations                                                               */
  /* ---------------------------------------------------------------------- */

  const add = useCallback(
    async (input: NewExpense) => {
      const id = input.id ?? newExpenseId();
      const queuedAt = new Date().toISOString();

      // Land it on screen first: at a checkout counter, waiting on a round trip
      // to confirm what you just typed is the difference between using the app
      // and not bothering.
      setExpenses((current) => [
        {
          id,
          user_id: userId ?? '',
          date: input.date,
          category: input.category,
          description: input.description,
          amount: input.amount,
          type: input.type,
          created_at: queuedAt,
          pending: true,
        },
        ...current,
      ]);

      setLastCategory(input.category);
      writeScoped(userId, 'last-category', input.category);

      enqueue(userId, { ...input, id, queued_at: queuedAt });
      setPendingCount(readQueue(userId).length);
      await syncQueue();
    },
    [userId, syncQueue]
  );

  const remove = useCallback(
    async (id: string) => {
      const target = expenses.find((exp) => exp.id === id);
      const snapshot = expenses;

      setExpenses((current) => current.filter((exp) => exp.id !== id));
      dequeue(userId, id);
      setPendingCount(readQueue(userId).length);

      // Never synced, so there is nothing on the server to delete.
      if (target?.pending) return;

      try {
        await deleteExpense(id);
      } catch (cause) {
        setExpenses(snapshot);
        throw cause;
      }
    },
    [expenses, userId]
  );

  const startPeriod = useCallback(
    async (period: NewBudgetPeriod) => {
      const created = await createBudgetPeriod(period);
      setPeriods((current) => {
        const next = [created, ...current.filter((p) => p.id !== created.id)];
        writeScoped(userId, 'periods', next);
        return next;
      });
      setError(null);
    },
    [userId]
  );

  const editPeriod = useCallback(
    async (
      id: string,
      patch: Partial<Pick<BudgetPeriod, 'amount' | 'start_date' | 'end_date' | 'stashed'>>
    ) => {
      const updated = await updateBudgetPeriod(id, patch);
      setPeriods((current) => {
        const next = current.map((p) => (p.id === updated.id ? updated : p));
        writeScoped(userId, 'periods', next);
        return next;
      });
      setError(null);
    },
    [userId]
  );

  /* ---------------------------------------------------------------------- */
  /* Derived                                                                 */
  /* ---------------------------------------------------------------------- */

  // `today` participates so the allowance recomputes when the date rolls over.
  const currentPeriod = useMemo(() => findCurrentPeriod(periods), [periods, today]);
  const lastEndedPeriod = useMemo(() => findLastEndedPeriod(periods), [periods, today]);

  // Falls back to the period that just ended so the day after one lapses shows a
  // closing summary rather than an empty screen.
  const allowance = useMemo(() => {
    const subject = currentPeriod ?? lastEndedPeriod;
    return subject ? computeAllowance(subject, expenses) : null;
  }, [currentPeriod, lastEndedPeriod, expenses, today]);

  const dismissAlert = useCallback(
    (tone: BudgetTone) => {
      const dismissal: AlertDismissal = { date: todayISO(), tone };
      setAlertDismissal(dismissal);
      writeScoped(userId, 'alert-dismissal', dismissal);
    },
    [userId]
  );

  const stash = useCallback(
    async (amount: number) => {
      if (!currentPeriod) return;
      const next = Math.max(0, Math.min(currentPeriod.amount, currentPeriod.stashed + amount));
      await editPeriod(currentPeriod.id, { stashed: next });
    },
    [currentPeriod, editPeriod]
  );

  /* ---------------------------------------------------------------------- */
  /* Export                                                                  */
  /* ---------------------------------------------------------------------- */

  const exportCSV = useCallback(
    (rows: Expense[] = expenses) => {
      if (rows.length === 0) return;
      const headers = ['Date', 'Category', 'Description', 'Amount (INR)', 'Type'];
      const body = rows.map((exp) => [
        exp.date,
        `"${exp.category}"`,
        `"${expenseTitle(exp).replace(/"/g, '""')}"`,
        exp.amount,
        exp.type,
      ]);

      const csv = [headers.join(','), ...body.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Spendly_Expenses_${todayISO()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [expenses]
  );

  const exportPDF = useCallback(
    (rows: Expense[] = expenses) => {
      if (rows.length === 0) return;

      const doc = new jsPDF();
      const generatedOn = todayISO();
      const totalSpent = rows.reduce((total, exp) => total + exp.amount, 0);

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SPENDLY - EXPENSE STATEMENT', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${generatedOn}`, 14, 27);
      doc.text(
        `Total Transactions: ${rows.length}  |  Total Spent: INR ${totalSpent.toLocaleString('en-IN')}`,
        14,
        33
      );

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Category', 'Description', 'Type', 'Amount']],
        body: rows.map((exp) => [
          exp.date,
          exp.category,
          expenseTitle(exp),
          exp.type,
          `INR ${exp.amount.toLocaleString('en-IN')}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        foot: [['', '', 'Total', '', `INR ${totalSpent.toLocaleString('en-IN')}`]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      });

      doc.save(`Spendly_Expenses_${generatedOn}.pdf`);
    },
    [expenses]
  );

  return {
    expenses,
    loading,
    error,
    today,
    isOnline,
    pendingCount,
    periods,
    currentPeriod,
    lastEndedPeriod,
    allowance,
    lastCategory,
    alertDismissal,
    dismissAlert,
    refresh,
    add,
    remove,
    startPeriod,
    editPeriod,
    stash,
    exportCSV,
    exportPDF,
  };
}
