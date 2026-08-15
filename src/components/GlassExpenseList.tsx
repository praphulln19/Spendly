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
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Clock,
  CloudOff,
  Filter,
  X,
} from 'lucide-react';
import { PickerMenu, type PickerOption } from './PickerMenu';

/*
 * A ledger reads best the way a bank statement does: grouped by day, one line
 * per entry, amounts in a single right-hand column your eye can run down.
 *
 * The previous version gave every entry a full card with its own padding, which
 * meant one line of information cost ~100px of height and the date was repeated
 * on every row. Grouping by day states the date once and lets the rows compress.
 */

type SortOrder = 'newest' | 'highest' | 'lowest';

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Newest',
  highest: 'Highest',
  lowest: 'Lowest',
};

interface GlassExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal?: () => void;
  onExportCSV?: (rows: Expense[]) => void;
  onExportPDF?: (rows: Expense[]) => void;
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

  const categoryOptions: PickerOption<ExpenseCategory | 'All'>[] = useMemo(
    () => [
      { value: 'All', label: 'All categories', icon: Filter, wide: true },
      ...expenseCategories.map((cat) => ({
        value: cat as ExpenseCategory | 'All',
        label: cat,
        icon: categoryIcons[cat],
      })),
    ],
    []
  );

  const sortOptions: PickerOption<SortOrder>[] = useMemo(
    () => [
      { value: 'newest', label: 'Newest first', icon: Clock },
      { value: 'highest', label: 'Highest amount', icon: ArrowDownWideNarrow },
      { value: 'lowest', label: 'Lowest amount', icon: ArrowUpNarrowWide },
    ],
    []
  );

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
        if (a.date === b.date) return b.created_at.localeCompare(a.created_at);
        return b.date.localeCompare(a.date);
      });
  }, [expenses, query, selectedCategory, sortBy]);

  useEffect(() => {
    onVisibleChange?.(filteredExpenses);
  }, [filteredExpenses, onVisibleChange]);

  /*
   * Grouping only makes sense in date order; sorting by amount is an explicit
   * request for one flat ranked list, so that view stays ungrouped.
   */
  const groups = useMemo(() => {
    if (sortBy !== 'newest') return null;
    const byDay = new Map<string, Expense[]>();
    for (const exp of filteredExpenses) {
      const day = exp.date.slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(exp);
    }
    return [...byDay.entries()].map(([day, rows]) => ({
      day,
      rows,
      total: rows.reduce((sum, exp) => sum + exp.amount, 0),
    }));
  }, [filteredExpenses, sortBy]);

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete ${expenseTitle(expense)} (${formatMoney(expense.amount)})?`)) return;
    setDeletingId(expense.id);
    try {
      await onDelete(expense.id);
    } finally {
      setDeletingId(null);
    }
  };

  const renderRow = (exp: Expense) => {
    const Icon = categoryIcons[exp.category] || fallbackCategoryIcon;
    const isDeleting = deletingId === exp.id;
    const title = expenseTitle(exp);
    // The title falls back to the category, so repeating it below adds nothing.
    const meta = title === exp.category ? exp.type : `${exp.category} · ${exp.type}`;

    return (
      <motion.div
        key={exp.id}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.18 }}
        className="group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-2xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
      >
        <div className="w-9 h-9 shrink-0 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-neutral-600 dark:text-neutral-300" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-neutral-900 dark:text-white truncate leading-tight">
            {title}
          </p>
          <p className="text-[11px] font-medium text-neutral-400 truncate mt-0.5">
            <span
              className={
                exp.type === 'Need'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-amber-600 dark:text-amber-400 font-semibold'
              }
            >
              {exp.type}
            </span>
            {title !== exp.category && <span> · {exp.category}</span>}
            {exp.pending && (
              <span className="inline-flex items-center gap-1 ml-1.5 text-amber-500 font-semibold">
                <CloudOff className="w-3 h-3" />
                Not synced
              </span>
            )}
          </p>
        </div>

        <span className="text-sm font-bold font-display tabular-nums text-neutral-900 dark:text-white shrink-0">
          {formatMoney(exp.amount)}
        </span>

        <button
          onClick={() => handleDelete(exp)}
          disabled={isDeleting}
          aria-label={`Delete ${title}`}
          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-red-500 hover:bg-red-500/10 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="apple-card w-full">
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full h-10 pl-10 pr-9 text-xs font-medium rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] border-0 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Both filters use the app's own picker, never a native select */}
            <PickerMenu
              value={selectedCategory}
              options={categoryOptions}
              onChange={setSelectedCategory}
              label="Filter by category"
              triggerLabel={selectedCategory === 'All' ? 'All categories' : selectedCategory}
              triggerIcon={selectedCategory === 'All' ? Filter : categoryIcons[selectedCategory]}
              active={selectedCategory !== 'All'}
              columns={2}
              menuWidth={288}
              className="flex-1 sm:flex-none sm:min-w-[150px]"
            />

            <PickerMenu
              value={sortBy}
              options={sortOptions}
              onChange={setSortBy}
              label="Sort expenses"
              triggerLabel={SORT_LABELS[sortBy]}
              triggerIcon={ArrowUpDown}
              menuWidth={200}
              className="shrink-0"
            />

            {onExportCSV && (
              <button
                onClick={() => onExportCSV(filteredExpenses)}
                aria-label="Download shown expenses as CSV"
                title="Download shown expenses as CSV"
                className="w-10 h-10 shrink-0 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {onExportPDF && (
              <button
                onClick={() => onExportPDF(filteredExpenses)}
                aria-label="Download shown expenses as PDF"
                title="Download shown expenses as PDF"
                className="w-10 h-10 shrink-0 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
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
      ) : groups ? (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.day}>
              <div className="flex items-baseline justify-between gap-3 pb-1.5 mb-1 border-b border-black/5 dark:border-white/10">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                  {formatDayLabel(group.day)}
                </h4>
                <span className="text-[11px] font-bold tabular-nums text-neutral-400">
                  {formatMoney(group.total)}
                </span>
              </div>
              <AnimatePresence initial={false}>{group.rows.map(renderRow)}</AnimatePresence>
            </section>
          ))}
        </div>
      ) : (
        <div>
          <AnimatePresence initial={false}>{filteredExpenses.map(renderRow)}</AnimatePresence>
        </div>
      )}
    </div>
  );
}
