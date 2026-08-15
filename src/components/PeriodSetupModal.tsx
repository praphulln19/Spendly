'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PiggyBank, Target } from 'lucide-react';
import type { BudgetPeriod, NewBudgetPeriod } from '../types/budget';
import {
  daysBetween,
  periodForThisMonth,
  periodOfNextDays,
  periodUntilDayOfMonth,
  todayISO,
} from '../utils/allowance';
import { formatMoney } from '../utils/format';

/*
 * A budget is an amount and a window, because "until the 5th, when my allowance
 * lands" is the span people actually live in -- calendar months only coincide
 * with it by accident. The daily figure updates as the form is filled, since
 * that number, not the total, is what someone is really deciding on.
 */

interface PeriodSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Present when editing rather than creating */
  existing: BudgetPeriod | null;
  /** Prefill, e.g. the suggested follow-on period after one lapses */
  initial?: NewBudgetPeriod | null;
  onSubmit: (period: NewBudgetPeriod) => Promise<void>;
  onStash?: (amount: number) => Promise<void>;
}

export function PeriodSetupModal({
  isOpen,
  onClose,
  existing,
  initial,
  onSubmit,
  onStash,
}: PeriodSetupModalProps) {
  const [amountInput, setAmountInput] = useState('');
  const [startDate, setStartDate] = useState(() => todayISO());
  const [endDate, setEndDate] = useState(() => periodForThisMonth().end_date);
  const [stashInput, setStashInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const seed: NewBudgetPeriod | null =
      existing
        ? { amount: existing.amount, start_date: existing.start_date, end_date: existing.end_date }
        : initial ?? null;

    const fallback = periodForThisMonth();
    setAmountInput(seed && seed.amount > 0 ? String(seed.amount) : '');
    setStartDate(seed?.start_date ?? todayISO());
    setEndDate(seed?.end_date ?? fallback.end_date);
    setStashInput('');
    setError(null);
    setSaving(false);
  }, [isOpen, existing, initial]);

  const amount = Number(amountInput);
  const days = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return 0;
    return daysBetween(startDate, endDate) + 1;
  }, [startDate, endDate]);

  const perDay = days > 0 && Number.isFinite(amount) && amount > 0 ? amount / days : 0;

  const applyPreset = (preset: NewBudgetPeriod) => {
    setStartDate(preset.start_date);
    setEndDate(preset.end_date);
  };

  const presets = [
    { label: 'This month', value: () => periodForThisMonth() },
    { label: 'Until the 1st', value: () => periodUntilDayOfMonth(1) },
    { label: 'Until the 5th', value: () => periodUntilDayOfMonth(5) },
    { label: 'Next 30 days', value: () => periodOfNextDays(30) },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter how much you have for this stretch.');
      return;
    }
    if (!startDate || !endDate || endDate < startDate) {
      setError('The end date has to be on or after the start date.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ amount, start_date: startDate, end_date: endDate });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this budget.');
      setSaving(false);
    }
  };

  const handleStash = async () => {
    const value = Number(stashInput);
    if (!onStash || !Number.isFinite(value) || value <= 0) return;
    setSaving(true);
    try {
      await onStash(value);
      setStashInput('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not move that to savings.');
    } finally {
      setSaving(false);
    }
  };

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
            className="relative z-10 w-full sm:max-w-md bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                    {existing ? 'Edit budget' : 'Set your budget'}
                  </h2>
                  <p className="text-[11px] font-semibold text-neutral-400">
                    How much, and how long it has to last
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Amount you have
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="12000"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                  className="w-full px-4 py-3 text-xl font-black font-display tabular-nums rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  autoFocus
                  required
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  How long
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset.value())}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Starts
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="input-field mt-1"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Ends
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="input-field mt-1"
                      required
                    />
                  </label>
                </div>
              </div>

              {/* The number the decision actually turns on */}
              <div className="rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  That works out to
                </p>
                <p className="text-2xl font-black font-display tabular-nums tracking-tight text-neutral-900 dark:text-white">
                  {perDay > 0 ? formatMoney(perDay) : '—'}
                  <span className="text-sm font-bold text-neutral-400"> a day</span>
                </p>
                <p className="text-[11px] font-semibold text-neutral-400 mt-0.5">
                  across {days > 0 ? days : '—'} {days === 1 ? 'day' : 'days'}
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm shadow-sm active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {saving ? 'Saving…' : existing ? 'Save changes' : 'Start budget'}
              </button>
            </form>

            {existing && onStash && (
              <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <PiggyBank className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Move to savings
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium mb-2">
                  Takes money out of the pool so it stops being shared across the days ahead.
                  {existing.stashed > 0 && ` Currently saved: ${formatMoney(existing.stashed)}.`}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="500"
                    value={stashInput}
                    onChange={(event) => setStashInput(event.target.value)}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleStash}
                    disabled={saving || !stashInput}
                    className="btn-secondary shrink-0 disabled:opacity-40"
                  >
                    Save it
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
