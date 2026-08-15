'use client';

import { useState } from 'react';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { AppShell, useAppChrome } from '../../components/AppShell';
import { GlassExpenseList } from '../../components/GlassExpenseList';
import { useExpenseStore } from '../../hooks/useExpenses';
import type { Expense } from '../../types/expense';
import { formatMoney } from '../../utils/format';

export default function ExpensesPage() {
  return (
    <AppShell>
      <ExpensesView />
    </AppShell>
  );
}

function ExpensesView() {
  const { expenses, loading, error, refresh, remove, exportCSV, exportPDF } = useExpenseStore();
  const { openAddExpense } = useAppChrome();

  // Exports follow whatever the list is currently showing rather than silently
  // dumping everything.
  const [visible, setVisible] = useState<Expense[]>(expenses);
  const visibleTotal = visible.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
            All expenses
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
            {formatMoney(visibleTotal)} across {visible.length}{' '}
            {visible.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        <button onClick={openAddExpense} className="hidden sm:inline-flex btn-primary">
          <Plus className="w-4 h-4" />
          <span>Add expense</span>
        </button>
      </div>

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-semibold">Loading expenses…</p>
        </div>
      ) : (
        <GlassExpenseList
          expenses={expenses}
          onDelete={remove}
          onOpenAddModal={openAddExpense}
          onExportCSV={exportCSV}
          onExportPDF={exportPDF}
          onVisibleChange={setVisible}
          showFilters
        />
      )}
    </div>
  );
}
