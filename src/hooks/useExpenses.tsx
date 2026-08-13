'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';
import { createExpense, deleteExpense, getExpenses, getUserBudget, saveUserBudget } from '../services/expenseService';
import type { Expense, NewExpense } from '../types/expense';

type ExpenseStore = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  refresh: () => Promise<void>;
  add: (expense: NewExpense) => Promise<Expense>;
  remove: (id: string) => Promise<void>;
  exportCSV: () => void;
  exportPDF: () => void;
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const savedBudget = localStorage.getItem('spendly_monthly_budget');
    if (savedBudget) {
      const parsed = Number(savedBudget);
      if (Number.isFinite(parsed) && parsed > 0) setMonthlyBudgetState(parsed);
    }
  }, []);

  const setMonthlyBudget = (budget: number) => {
    setMonthlyBudgetState(budget);
    localStorage.setItem('spendly_monthly_budget', String(budget));
    void saveUserBudget(budget);
  };

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [data, dbBudget] = await Promise.all([
        getExpenses(),
        getUserBudget(),
      ]);
      setExpenses(data);
      if (dbBudget !== null && dbBudget > 0) {
        setMonthlyBudgetState(dbBudget);
        localStorage.setItem('spendly_monthly_budget', String(dbBudget));
      }
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load expenses.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
      if (!data.session) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setExpenses([]);
        setLoading(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  const add = async (expense: NewExpense) => {
    const saved = await createExpense(expense);
    setExpenses(current => [saved, ...current]);
    return saved;
  };

  const remove = async (id: string) => {
    await deleteExpense(id);
    setExpenses(current => current.filter(expense => expense.id !== id));
  };

  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Category', 'Description', 'Amount (INR)', 'Type'];
    const rows = expenses.map(exp => [
      exp.date,
      `"${exp.category}"`,
      `"${exp.description.replace(/"/g, '""')}"`,
      exp.amount,
      exp.type,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Spendly_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (expenses.length === 0) return;

    const doc = new jsPDF();
    const today = new Date().toISOString().slice(0, 10);
    const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SPENDLY - EXPENSE STATEMENT', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${today}`, 14, 27);
    doc.text(`Total Transactions: ${expenses.length}  |  Total Spent: INR ${totalSpent.toLocaleString('en-IN')}`, 14, 33);

    const tableData = expenses.map(exp => [
      exp.date,
      exp.category,
      exp.description,
      exp.type,
      `INR ${exp.amount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Category', 'Description', 'Type', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      foot: [['', '', 'Total', '', `INR ${totalSpent.toLocaleString('en-IN')}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    doc.save(`Spendly_Expenses_${today}.pdf`);
  };

  return {
    expenses,
    loading,
    error,
    monthlyBudget,
    setMonthlyBudget,
    refresh,
    add,
    remove,
    exportCSV,
    exportPDF,
  };
}
