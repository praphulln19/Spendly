'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, FileText, IndianRupee } from 'lucide-react';
import { expenseCategories, type ExpenseCategory, type ExpenseType } from '../types/expense';

interface GlassAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: {
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    type: ExpenseType;
  }) => Promise<void>;
}

export function GlassAddExpenseModal({ isOpen, onClose, onAdd }: GlassAddExpenseModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<ExpenseType>('Need');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Please select a valid date.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description for this expense.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Please enter an amount greater than ₹0.');
      return;
    }

    setSaving(true);
    try {
      await onAdd({
        date,
        category,
        description: description.trim(),
        amount: numericAmount,
        type,
      });
      setDescription('');
      setAmount('');
      setError(null);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Spring Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
                  Add Expense
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Log spending into your student tracker
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Need / Want Apple Segmented Control */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setType('Need')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      type === 'Need'
                        ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    Need (Essential)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Want')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      type === 'Want'
                        ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    Want (Discretionary)
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              {/* Category selector grid */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span>Category</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {expenseCategories.map((cat) => {
                    const selected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                            : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Description</span>
                </label>
                <input
                  type="text"
                  placeholder="What did you spend on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
                  <span>Amount (INR)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
