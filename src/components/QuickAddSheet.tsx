'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, X, MessageSquarePlus, Calendar, ChevronDown, Check, Tag } from 'lucide-react';
import {
  categoryDefaultType,
  expenseCategories,
  type ExpenseCategory,
  type ExpenseType,
  type NewExpense,
} from '../types/expense';
import { addDays, formatDayLabel, formatDaysOfAllowance, todayISO } from '../utils/allowance';
import { formatMoney } from '../utils/format';
import { categoryIcons } from './categoryIcons';

/*
 * Logging a spend is done several times a day, standing up, one handed.
 *
 * The amount leads, at the same weight the Today screen gives the allowance, so
 * the sheet reads as one number being built. Everything else is a default that
 * only needs touching in the exception: category is preselected from last time,
 * Need/Want follows the category, the note is behind a tap, and the day is
 * today.
 */

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: NewExpense) => Promise<void>;
  /** Prices the entry in days of allowance while it is typed */
  todayBudget: number;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/*
 * The numpad is four 52px rows with 8px gaps, and there are exactly ten
 * categories. Five rows of two at 40px lands on the same total, so the category
 * grid swaps into the pad's place without the sheet changing height.
 */
const SWAP_AREA_HEIGHT = 4 * 52 + 3 * 8;

const PAD_KEY =
  'h-[52px] text-[19px] font-bold font-display tabular-nums rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] text-neutral-900 dark:text-white active:bg-black/10 dark:active:bg-white/15 active:scale-95 transition-all';

const PAD_ACTION =
  'h-[52px] rounded-2xl flex items-center justify-center active:scale-95 transition-all';

export function QuickAddSheet({ isOpen, onClose, onAdd, todayBudget }: QuickAddSheetProps) {
  const [digits, setDigits] = useState('');
  // Unset until chosen, so the control is a prompt rather than a value the user
  // never actually picked.
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [type, setType] = useState<ExpenseType>('Need');
  const [typeTouched, setTypeTouched] = useState(false);
  const [date, setDate] = useState(() => todayISO());
  const [note, setNote] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [pickingCategory, setPickingCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = Number(digits || '0');
  const hasAmount = amount > 0;
  const valid = hasAmount && category !== null;
  const CategoryIcon = category ? categoryIcons[category] : Tag;

  useEffect(() => {
    if (!isOpen) return;
    setDigits('');
    setCategory(null);
    setType('Need');
    setTypeTouched(false);
    setDate(todayISO());
    setNote('');
    setNoteOpen(false);
    setPickingCategory(false);
    setError(null);
    setSaving(false);
  }, [isOpen]);

  const press = useCallback((key: string) => {
    setError(null);
    setDigits((current) => {
      const next = current + key;
      if (next.replace(/^0+/, '').length > 7) return current;
      return next.replace(/^0+(?=\d)/, '');
    });
  }, []);

  const backspace = useCallback(() => setDigits((current) => current.slice(0, -1)), []);

  const chooseCategory = (next: ExpenseCategory) => {
    setCategory(next);
    if (!typeTouched) setType(categoryDefaultType[next]);
    setPickingCategory(false);
  };

  const submit = useCallback(async () => {
    if (!hasAmount) {
      setError('Enter an amount first.');
      return;
    }
    if (!category) {
      setError('Pick a category first.');
      setPickingCategory(true);
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
  }, [hasAmount, date, category, note, amount, type, onAdd, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      // Escape backs out of the picker before it closes the whole sheet.
      if (event.key === 'Escape') {
        if (pickingCategory) setPickingCategory(false);
        else onClose();
        return;
      }
      if (pickingCategory) return;
      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === 'Backspace') backspace();
      else if (event.key === 'Enter') void submit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, pickingCategory, press, backspace, submit, onClose]);

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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 w-full sm:max-w-[380px] bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 rounded-t-[28px] sm:rounded-[28px] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-5 shadow-2xl max-h-[95vh] overflow-y-auto scrollbar-none"
          >
            <div className="sm:hidden w-9 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto mb-3" />

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold font-display text-neutral-900 dark:text-white">
                Add expense
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount — the hero, same treatment as the Today figure */}
            <div className="text-center pt-2 pb-4">
              <div
                className={`font-display font-black tabular-nums leading-none tracking-[-0.045em] text-[3.25rem] transition-colors ${
                  hasAmount
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-200 dark:text-neutral-700'
                }`}
              >
                <span className="mr-1">₹</span>
                {amount.toLocaleString('en-IN')}
              </div>
              <p className="mt-2 h-4 text-[11px] font-semibold text-neutral-400">
                {hasAmount && todayBudget > 0
                  ? `${formatDaysOfAllowance(amount, todayBudget)} of today's allowance`
                  : ''}
              </p>
            </div>

            {/* Category: one control showing the current choice, opening a grid */}
            <button
              type="button"
              onClick={() => setPickingCategory((open) => !open)}
              aria-expanded={pickingCategory}
              className={`w-full h-11 px-3.5 rounded-2xl flex items-center gap-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                pickingCategory
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-black/[0.05] dark:bg-white/[0.08] text-neutral-900 dark:text-white'
              }`}
            >
              <CategoryIcon className="w-4 h-4 shrink-0 opacity-70" />
              <span
                className={`flex-1 text-left truncate ${
                  !category && !pickingCategory ? 'text-neutral-500 dark:text-neutral-400' : ''
                }`}
              >
                {category ?? 'Select category'}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 opacity-50 transition-transform duration-200 ${
                  pickingCategory ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Pad and category grid share one fixed area, so picking a category
                never resizes the sheet or scrolls the amount out of view. */}
            <div className="relative my-4" style={{ height: SWAP_AREA_HEIGHT }}>
              <AnimatePresence initial={false} mode="wait">
                {pickingCategory ? (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 grid grid-cols-2 grid-rows-5 gap-2"
                  >
                    {expenseCategories.map((cat) => {
                      const Icon = categoryIcons[cat];
                      const selected = cat === category;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => chooseCategory(cat)}
                          aria-pressed={selected}
                          className={`flex items-center gap-2 px-3 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
                            selected
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : 'bg-black/[0.04] dark:bg-white/[0.07] text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0 opacity-70" />
                          <span className="flex-1 text-left truncate">{cat}</span>
                          {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="numpad"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 grid grid-cols-3 gap-2 max-w-[300px] mx-auto"
                  >
                    {DIGITS.map((digit) => (
                      <button key={digit} type="button" onClick={() => press(digit)} className={PAD_KEY}>
                        {digit}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setNoteOpen((open) => !open)}
                      aria-label={noteOpen ? 'Hide note' : 'Add a note'}
                      aria-pressed={noteOpen}
                      className={`${PAD_ACTION} ${
                        noteOpen || note
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'text-neutral-400 active:bg-black/10 dark:active:bg-white/15'
                      }`}
                    >
                      <MessageSquarePlus className="w-[21px] h-[21px]" />
                    </button>

                    <button type="button" onClick={() => press('0')} className={PAD_KEY}>
                      0
                    </button>

                    <button
                      type="button"
                      onClick={backspace}
                      aria-label="Delete last digit"
                      className={`${PAD_ACTION} text-neutral-400 active:bg-black/10 dark:active:bg-white/15`}
                    >
                      <Delete className="w-[22px] h-[22px]" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Two controls, two equal halves */}
            <div className="flex items-stretch gap-2 h-11">
              <div className="grid grid-cols-2 flex-1 basis-0 p-0.5 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08]">
                {(['Need', 'Want'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setType(option);
                      setTypeTouched(true);
                    }}
                    className={`text-xs font-bold rounded-[14px] transition-all ${
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

              <label className="relative flex-1 basis-0 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>{formatDayLabel(date)}</span>
                <input
                  type="date"
                  value={date}
                  max={todayISO()}
                  min={addDays(todayISO(), -365)}
                  onChange={(event) => event.target.value && setDate(event.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Expense date"
                />
              </label>
            </div>

            {noteOpen && (
              <input
                type="text"
                autoFocus
                placeholder="What was it for?"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                className="w-full mt-2 px-4 h-11 text-sm font-medium rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] border-0 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            )}

            {error && <p className="mt-2 text-xs font-semibold text-red-500 text-center">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={saving || !valid}
              className={`w-full mt-3 h-[52px] rounded-2xl font-bold text-sm transition-all ${
                valid
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm active:scale-[0.98]'
                  : 'bg-black/[0.05] dark:bg-white/[0.08] text-neutral-400 cursor-not-allowed'
              }`}
            >
              {saving
                ? 'Saving…'
                : valid
                ? `Add ${formatMoney(amount)}`
                : hasAmount
                ? 'Select a category'
                : 'Enter an amount'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
