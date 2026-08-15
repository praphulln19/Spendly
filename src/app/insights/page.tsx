'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AppShell, useAppChrome } from '../../components/AppShell';
import { BudgetRing } from '../../components/BudgetRing';
import { AnalyticsBarChart } from '../../components/AnalyticsBarChart';
import { GlassCategoryBreakdown } from '../../components/GlassCategoryBreakdown';
import { NeedWantSplit } from '../../components/NeedWantSplit';
import { useExpenseStore } from '../../hooks/useExpenses';
import { expensesInPeriod } from '../../utils/allowance';
import {
  formatMonthLabel,
  getExpensesForMonth,
  getMonthKey,
  getNextMonthKey,
  getPreviousMonthKey,
} from '../../utils/budgetUtils';
import { formatMoney } from '../../utils/format';

export default function InsightsPage() {
  return (
    <AppShell>
      <InsightsView />
    </AppShell>
  );
}

function InsightsView() {
  const { expenses, loading, allowance } = useExpenseStore();
  const { openBudget } = useAppChrome();

  const currentMonthKey = useMemo(() => getMonthKey(new Date()), []);
  const [monthKey, setMonthKey] = useState(currentMonthKey);

  const monthExpenses = useMemo(() => getExpensesForMonth(expenses, monthKey), [expenses, monthKey]);
  const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const periodExpenses = allowance ? expensesInPeriod(expenses, allowance.period) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Loading your history…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current budget — period-scoped, matching what Today is counting down */}
      <section>
        <h1 className="text-2xl font-black font-display tracking-tight text-neutral-900 dark:text-white mb-4">
          Insights
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BudgetRing allowance={allowance} onOpenSetBudget={openBudget} />
          {allowance && (
            <NeedWantSplit expenses={periodExpenses} todayBudget={allowance.todayBudget} />
          )}
        </div>
      </section>

      {/* History — browsed by calendar month, independent of budget windows */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-neutral-900 dark:text-white">
              History
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
              {formatMoney(monthTotal)} across {monthExpenses.length}{' '}
              {monthExpenses.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            <button
              onClick={() => setMonthKey(getPreviousMonthKey(monthKey))}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold font-display text-[11px] whitespace-nowrap">
              {formatMonthLabel(monthKey)}
            </span>
            <button
              onClick={() => setMonthKey(getNextMonthKey(monthKey))}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {monthKey !== currentMonthKey && (
              <button
                onClick={() => setMonthKey(currentMonthKey)}
                className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Current
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnalyticsBarChart expenses={expenses} selectedMonthKey={monthKey} />
          <GlassCategoryBreakdown expenses={expenses} selectedMonthKey={monthKey} />
        </div>
      </section>
    </div>
  );
}
