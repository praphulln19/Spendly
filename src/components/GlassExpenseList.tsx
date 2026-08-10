'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expense, ExpenseCategory } from '../types/expense';
import { expenseCategories } from '../types/expense';
import { formatMoney } from './SummaryCards';
import {
  Search,
  Trash2,
  ReceiptText,
  Plus,
  Download,
  Sparkles,
  ArrowUpDown,
  Utensils,
  Bus,
  GraduationCap,
  Home,
  Smartphone,
  ShoppingBag,
  Film,
  User,
  Repeat,
  CircleEllipsis,
  type LucideIcon,
} from 'lucide-react';

const categoryIcons: Record<ExpenseCategory, LucideIcon> = {
  Food: Utensils,
  Transport: Bus,
  Education: GraduationCap,
  'Rent/Hostel': Home,
  'Mobile/Internet': Smartphone,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Personal: User,
  Subscriptions: Repeat,
  Other: CircleEllipsis,
};

function formatDate(dateString: string) {
  if (!dateString) return '';
  const [year, month, day] = dateString.slice(0, 10).split('-');
  return `${day}-${month}-${year}`;
}

interface GlassExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal?: () => void;
  onExportCSV?: () => void;
  onLoadSampleData?: () => Promise<void>;
  showFilters?: boolean;
}

export function GlassExpenseList({
  expenses,
  onDelete,
  onOpenAddModal,
  onExportCSV,
  onLoadSampleData,
  showFilters = true,
}: GlassExpenseListProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
      const matchesQuery =
        exp.description.toLowerCase().includes(query.toLowerCase()) ||
        exp.category.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handleDelete = async (expense: Expense) => {
    if (window.confirm(`Delete "${expense.description}" (${formatMoney(expense.amount)})?`)) {
      setDeletingId(expense.id);
      try {
        await onDelete(expense.id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="apple-card w-full">
      {/* Controls & Export Header */}
      {showFilters && (
        <div className="flex flex-col gap-4 mb-6">
          {/* Top Search & Actions Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Sort & Export Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none focus:outline-none text-xs font-semibold"
                >
                  <option value="newest" className="dark:bg-neutral-900">Newest</option>
                  <option value="highest" className="dark:bg-neutral-900">Highest Amount</option>
                  <option value="lowest" className="dark:bg-neutral-900">Lowest Amount</option>
                </select>
              </div>

              {onExportCSV && (
                <button
                  onClick={onExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-neutral-800 dark:text-neutral-200"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Scroll Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['All', ...expenseCategories] as const).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense List Items */}
      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3 text-neutral-400">
            <ReceiptText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold font-display text-neutral-900 dark:text-white mb-1">
            No expenses found
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
            {query || selectedCategory !== 'All'
              ? 'Try clearing search filters or selecting a different category.'
              : 'Add your expenses or load sample data to explore analytics.'}
          </p>

          <div className="flex flex-row items-center justify-center gap-3 flex-wrap">
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            )}

            {onLoadSampleData && (
              <button
                onClick={onLoadSampleData}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Load Demo Data</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {filteredExpenses.map((exp) => {
              const Icon = categoryIcons[exp.category] || CircleEllipsis;
              const isDeleting = deletingId === exp.id;

              return (
                <motion.div
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {exp.description}
                      </h5>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {exp.category} • {formatDate(exp.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className={exp.type === 'Need' ? 'badge-need' : 'badge-want'}>
                        {exp.type}
                      </span>
                      <span className="text-sm font-extrabold font-display text-neutral-900 dark:text-white mt-1">
                        {formatMoney(exp.amount)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(exp)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete expense"
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
