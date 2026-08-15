'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { expenseTitle, type Expense, type ExpenseCategory } from '../types/expense';
import { expenseCategories } from '../types/expense';
import { formatMoney } from '../utils/format';
import { formatDayLabel } from '../utils/allowance';
import { categoryIcons, fallbackCategoryIcon } from './categoryIcons';
import {
  Search,
  Trash2,
  ReceiptText,
  Plus,
  Download,
  FileText,
  ArrowUpDown,
  CloudOff,
} from 'lucide-react';

type SortOrder = 'newest' | 'highest' | 'lowest';

interface GlassExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal?: () => void;
  onExportCSV?: (rows: Expense[]) => void;
  onExportPDF?: (rows: Expense[]) => void;
  /** Reports the filtered set so callers can export exactly what is on screen */
  onVisibleChange?: (rows: Expense[]) => void;
  showFilters?: boolean;
}

export function GlassExpenseList({
  expenses,
  onDelete,
  onOpenAddModal,
  onExportCSV,
  onExportPDF,
  onVisibleChange,
  showFilters = true,
}: GlassExpenseListProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOrder>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return expenses
      .filter((exp) => {
        const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
        const matchesQuery =
          needle.length === 0 ||
          expenseTitle(exp).toLowerCase().includes(needle) ||
          exp.category.toLowerCase().includes(needle);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        // Same-day entries fall back to entry order, newest first.
        if (a.date === b.date) return b.created_at.localeCompare(a.created_at);
        return b.date.localeCompare(a.date);
      });
  }, [expenses, query, selectedCategory, sortBy]);

  useEffect(() => {
    onVisibleChange?.(filteredExpenses);
  }, [filteredExpenses, onVisibleChange]);

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete ${expenseTitle(expense)} (${formatMoney(expense.amount)})?`)) return;
    setDeletingId(expense.id);
    try {
      await onDelete(expense.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="apple-card w-full">
      {showFilters && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search expenses…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOrder)}
                  aria-label="Sort expenses"
                  className="bg-transparent border-none focus:outline-none text-xs font-semibold"
                >
                  <option value="newest" className="dark:bg-neutral-900">Newest</option>
                  <option value="highest" className="dark:bg-neutral-900">Highest</option>
                  <option value="lowest" className="dark:bg-neutral-900">Lowest</option>
                </select>
              </div>

              {onExportCSV && (
                <button
                  onClick={() => onExportCSV(filteredExpenses)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-neutral-800 dark:text-neutral-200"
                  title="Download what is shown as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              )}

              {onExportPDF && (
                <button
                  onClick={() => onExportPDF(filteredExpenses)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all"
                  title="Download what is shown as PDF"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['All', ...expenseCategories] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3 text-neutral-400">
            <ReceiptText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold font-display text-neutral-900 dark:text-white mb-1">
            {query || selectedCategory !== 'All' ? 'Nothing matches that' : 'No expenses yet'}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
            {query || selectedCategory !== 'All'
              ? 'Clear the search or pick a different category.'
              : 'Log your first spend to start tracking.'}
          </p>

          {onOpenAddModal && !query && selectedCategory === 'All' && (
            <button onClick={onOpenAddModal} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span>Add expense</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {filteredExpenses.map((exp) => {
              const Icon = categoryIcons[exp.category] || fallbackCategoryIcon;
              const isDeleting = deletingId === exp.id;

              return (
                <motion.div
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm shrink-0">
                      <Icon className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {expenseTitle(exp)}
                      </h5>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {exp.category} · {formatDayLabel(exp.date)}
                        {exp.pending && (
                          <span className="inline-flex items-center gap-1 ml-1.5 text-amber-500 font-semibold">
                            <CloudOff className="w-3 h-3" />
                            Not synced
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className={exp.type === 'Need' ? 'badge-need' : 'badge-want'}>
                        {exp.type}
                      </span>
                      <span className="text-sm font-extrabold font-display tabular-nums text-neutral-900 dark:text-white mt-1">
                        {formatMoney(exp.amount)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(exp)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                      aria-label={`Delete ${expenseTitle(exp)}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
