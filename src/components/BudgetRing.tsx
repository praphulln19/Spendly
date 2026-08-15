'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, PiggyBank, SlidersHorizontal, Target } from 'lucide-react';
import type { Allowance } from '../utils/allowance';
import { formatPeriodLabel } from '../utils/allowance';
import { formatMoney } from '../utils/format';

/*
 * Whole-period progress, as a counterpart to the Today screen's day-by-day view:
 * how far through the money you are against how far through the days.
 */

interface BudgetRingProps {
  allowance: Allowance | null;
  onOpenSetBudget: () => void;
}

export function BudgetRing({ allowance, onOpenSetBudget }: BudgetRingProps) {
  if (!allowance) {
    return (
      <div className="apple-card flex flex-col justify-center items-center text-center min-h-[260px]">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">No budget running</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-4">
          Set an amount and a window to start tracking.
        </p>
        <button onClick={onOpenSetBudget} className="btn-primary">
          <span>Set your budget</span>
        </button>
      </div>
    );
  }

  const { spendable, spentTotal, remaining, daysTotal, daysRemaining, dayIndex, stashed } = allowance;

  const spentShare = spendable > 0 ? Math.min(100, Math.max(0, (spentTotal / spendable) * 100)) : 0;
  const timeShare = daysTotal > 0 ? Math.min(100, (dayIndex / daysTotal) * 100) : 0;
  // Ahead of pace means the money is going faster than the days are.
  const aheadOfPace = spentShare > timeShare + 5;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (spentShare / 100) * circumference;

  const statusTone =
    remaining < 0
      ? 'text-red-500 bg-red-500/10 border-red-500/20'
      : aheadOfPace
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

  const StatusIcon = remaining < 0 || aheadOfPace ? AlertTriangle : CheckCircle2;
  const statusText = remaining < 0 ? 'Over budget' : aheadOfPace ? 'Spending fast' : 'On pace';

  return (
    <div className="apple-card flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
            This budget
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatPeriodLabel(allowance.period)}
          </p>
        </div>
        <button
          onClick={onOpenSetBudget}
          className="p-2 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Edit budget"
        >
          <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-black/5 dark:stroke-white/10"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              className={
                remaining < 0 ? 'stroke-red-500' : aheadOfPace ? 'stroke-amber-500' : 'stroke-blue-500'
              }
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-display tabular-nums tracking-tight text-neutral-900 dark:text-white">
              {Math.round(spentShare)}%
            </span>
            <span className="text-[10px] font-bold uppercase text-neutral-400">spent</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border self-start ${statusTone}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </div>

          <div>
            <p className="text-xs text-neutral-400 font-medium">Left to spend</p>
            <p className="text-xl font-black font-display tabular-nums text-neutral-900 dark:text-white">
              {formatMoney(remaining)}
            </p>
            <p className="text-[11px] text-neutral-400 font-medium">
              over {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} · day {dayIndex} of{' '}
              {daysTotal}
            </p>
          </div>

          <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-400 font-medium">Spent</span>
              <span className="text-xs font-semibold tabular-nums text-neutral-700 dark:text-neutral-300">
                {formatMoney(spentTotal)}
              </span>
            </div>
            {stashed > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-emerald-500 font-medium inline-flex items-center gap-1">
                  <PiggyBank className="w-3 h-3" /> Saved
                </span>
                <span className="text-xs font-semibold tabular-nums text-emerald-500">
                  {formatMoney(stashed)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-dashed border-black/5 dark:border-white/10">
              <span className="text-xs text-neutral-500 font-bold">Budget</span>
              <span className="text-sm font-bold font-display tabular-nums text-neutral-900 dark:text-white">
                {formatMoney(allowance.amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
