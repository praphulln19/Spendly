'use client';

import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { AppShell, useAppChrome } from '../components/AppShell';
import { TodayHero } from '../components/TodayHero';
import { NeedWantSplit } from '../components/NeedWantSplit';
import { GlassExpenseList } from '../components/GlassExpenseList';
import { useExpenseStore } from '../hooks/useExpenses';
import { expensesInPeriod, expensesOnDay } from '../utils/allowance';
import { formatMoney } from '../utils/format';

export default function TodayPage() {
  return (
    <AppShell>
      <TodayView />
    </AppShell>
  );
}

function TodayView() {
  const { allowance, expenses, loading, error, today, refresh, remove, currentPeriod } =
    useExpenseStore();
  const { openAddExpense, openBudget } = useAppChrome();

  const todaysExpenses = expensesOnDay(expenses, today);
  const periodExpenses = allowance ? expensesInPeriod(expenses, allowance.period) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Working out today&apos;s number…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          <span>{error}</span>
          <button
            onClick={() => refresh()}
            className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <TodayHero allowance={allowance} expenses={expenses} onSetBudget={openBudget} />

      {/* Today's entries */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white">
            Today
          </h2>
          {todaysExpenses.length > 0 && (
            <span className="text-xs font-bold text-neutral-400 tabular-nums">
              {formatMoney(todaysExpenses.reduce((sum, exp) => sum + exp.amount, 0))} ·{' '}
              {todaysExpenses.length} {todaysExpenses.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        {todaysExpenses.length === 0 ? (
          <div className="apple-card flex flex-col items-center text-center py-10">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
              Nothing logged today
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-5">
              Log spending as it happens and tomorrow&apos;s number stays honest.
            </p>
            <button onClick={openAddExpense} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span>Add expense</span>
            </button>
          </div>
        ) : (
          <GlassExpenseList
            expenses={todaysExpenses}
            onDelete={remove}
            onOpenAddModal={openAddExpense}
            showFilters={false}
          />
        )}
      </section>

      {currentPeriod && allowance && periodExpenses.length > 0 && (
        <NeedWantSplit expenses={periodExpenses} todayBudget={allowance.todayBudget} />
      )}
    </div>
  );
}
