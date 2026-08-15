'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, X, MessageSquarePlus, Calendar } from 'lucide-react';
import {
  categoryDefaultType,
  expenseCategories,
  type ExpenseCategory,
  type ExpenseType,
  type NewExpense,
} from '../types/expense';
import { addDays, formatDayLabel, formatDaysOfAllowance, todayISO } from '../utils/allowance';
import { formatMoney } from '../utils/format';

/*
 * Logging a spend is the thing people do several times a day, standing up, one
 * handed. So: amount first on a numpad, and every other field carries a sensible
 * default. Category comes preselected from last time, Need/Want is inferred from
 * the category, the note is collapsed behind a tap, and the day defaults to
 * today. Two taps covers the common case; nothing else is required.
 */

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: NewExpense) => Promise<void>;
  defaultCategory: ExpenseCategory;
  /** Used to price the entry in days of allowance while it is being typed */
  todayBudget: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'] as const;

export function QuickAddSheet({
  isOpen,
  onClose,
  onAdd,
  defaultCategory,
  todayBudget,
}: QuickAddSheetProps) {
  const [digits, setDigits] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(defaultCategory);
  const [type, setType] = useState<ExpenseType>(categoryDefaultType[defaultCategory]);
  const [typeTouched, setTypeTouched] = useState(false);
  const [date, setDate] = useState(() => todayISO());
  const [note, setNote] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = Number(digits || '0');

  useEffect(() => {
    if (!isOpen) return;
    setDigits('');
    setCategory(defaultCategory);
    setType(categoryDefaultType[defaultCategory]);
    setTypeTouched(false);
    setDate(todayISO());
    setNote('');
    setNoteOpen(false);
    setError(null);
    setSaving(false);
  }, [isOpen, defaultCategory]);

  const press = useCallback((key: string) => {
    setDigits((current) => {
      const next = current + key;
      // 7 digits is ₹9,999,999 -- well past anything a real entry needs.
      if (next.replace(/^0+/, '').length > 7) return current;
      return next.replace(/^0+(?=\d)/, '');
    });
  }, []);

  const backspace = useCallback(() => setDigits((current) => current.slice(0, -1)), []);

  const chooseCategory = (next: ExpenseCategory) => {
    setCategory(next);
    // Respect an explicit Need/Want choice; otherwise follow the category.
    if (!typeTouched) setType(categoryDefaultType[next]);
  };

  const submit = useCallback(async () => {
    if (amount <= 0) {
      setError('Enter an amount first.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAdd({ date, category, description: note.trim(), amount, type });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save that expense.');
      setSaving(false);
    }
  }, [amount, date, category, note, type, onAdd, onClose]);

  // Desktop users have a keyboard in front of them; let them use it.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === 'Backspace') backspace();
      else if (event.key === 'Enter') void submit();
      else if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, press, backspace, submit, onClose]);

  const dayOptions = [
    { value: todayISO(), label: 'Today' },
    { value: addDays(todayISO(), -1), label: 'Yesterday' },
    { value: addDays(todayISO(), -2), label: formatDayLabel(addDays(todayISO(), -2)) },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative z-10 w-full sm:max-w-md bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                  Add expense
                </h2>
                <p className="text-[11px] font-semibold text-neutral-400">
                  {formatDayLabel(date)} · {category}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount */}
            <div className="text-center py-3">
              <div
                className={`font-display font-black tabular-nums tracking-[-0.04em] text-5xl ${
                  amount > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-300 dark:text-neutral-700'
                }`}
              >
                <span className="text-[0.45em] font-bold align-top mr-0.5 tracking-normal">₹</span>
                {amount.toLocaleString('en-IN')}
              </div>
              <p className="mt-1 h-4 text-[11px] font-semibold text-neutral-400">
                {amount > 0 && todayBudget > 0
                  ? `${formatDaysOfAllowance(amount, todayBudget)} of allowance`
                  : ''}
              </p>
            </div>

            {error && (
              <div className="mb-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => press(key)}
                  className="py-3.5 text-xl font-bold font-display tabular-nums rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] text-neutral-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all"
                >
                  {key}
                </button>
              ))}
              <button
                type="button"
                onClick={backspace}
                aria-label="Delete last digit"
                className="py-3.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] text-neutral-500 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none mt-4 -mx-1 px-1 pb-1">
              {expenseCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => chooseCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Need / Want + day */}
            <div className="flex items-center gap-2 mt-3">
              <div className="grid grid-cols-2 p-0.5 rounded-2xl bg-black/5 dark:bg-white/10 flex-1">
                {(['Need', 'Want'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setType(option);
                      setTypeTouched(true);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      type === option
                        ? option === 'Need'
                          ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'text-neutral-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setNoteOpen((open) => !open)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                  noteOpen || note
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-500'
                }`}
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>
            </div>

            {noteOpen && (
              <input
                type="text"
                autoFocus
                placeholder="What was it for? (optional)"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                className="input-field mt-2"
              />
            )}

            {/* Day — backfilling matters: an unlogged day silently inflates every
                later allowance. */}
            <div className="flex items-center gap-1.5 mt-3">
              {dayOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDate(option.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    date === option.value
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-black/5 dark:bg-white/10 text-neutral-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <label className="relative ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-neutral-500 text-xs font-semibold cursor-pointer">
                <Calendar className="w-3.5 h-3.5" />
                <span>Pick</span>
                <input
                  type="date"
                  value={date}
                  max={todayISO()}
                  onChange={(event) => event.target.value && setDate(event.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={saving || amount <= 0}
              className="w-full mt-4 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
            >
              {saving ? 'Saving…' : amount > 0 ? `Add ${formatMoney(amount)}` : 'Add expense'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
