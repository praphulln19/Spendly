'use client';

import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle2, SlidersHorizontal, ArrowUpRight, Sparkles, Plus } from 'lucide-react';
import type { Expense } from '../types/expense';
import {
  getMonthKey,
  formatMonthLabel,
  getExpensesForMonth,
  getCarryoverAmount,
  getDaysRemainingInMonth,
} from '../utils/budgetUtils';

interface BudgetRingProps {
  expenses: Expense[];
  monthlyBudget: number;
  onOpenSetBudget: () => void;
  selectedMonthKey?: string;
}

export function BudgetRing({
  expenses,
  monthlyBudget,
  onOpenSetBudget,
  selectedMonthKey = getMonthKey(new Date()),
}: BudgetRingProps) {
  const isCurrentMonth = selectedMonthKey === getMonthKey(new Date());

  if (monthlyBudget <= 0) {
    return (
      <div className="apple-card flex flex-col justify-between h-full min-h-[260px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                Budget Goal
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatMonthLabel(selectedMonthKey)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center my-auto py-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            No Monthly Budget Set
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-4">
            Set your target spending limit for the present month to enable tracking.
          </p>

          {isCurrentMonth ? (
            <button
              onClick={onOpenSetBudget}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Set Monthly Budget</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-neutral-400">
              Budget can only be set for the present month
            </span>
          )}
        </div>
      </div>
    );
  }

  const monthExpenses = getExpensesForMonth(expenses, selectedMonthKey);
  const totalSpent = monthExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  const carryover = getCarryoverAmount(expenses, selectedMonthKey, monthlyBudget);
  const effectiveBudget = monthlyBudget + carryover;

  const remainingBudget = effectiveBudget - totalSpent;
  const percentage =
    effectiveBudget > 0
      ? Math.min(100, Math.max(0, Math.round((totalSpent / effectiveBudget) * 100)))
      : 0;

  const { daysRemaining } = getDaysRemainingInMonth(selectedMonthKey);

  const dailyAllowance =
    daysRemaining > 0 ? Math.max(0, Math.round(remainingBudget / daysRemaining)) : 0;

  let statusText = 'On Track';
  let statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  let StatusIcon = CheckCircle2;

  if (percentage >= 100) {
    statusText = 'Budget Exceeded';
    statusColor = 'text-red-500 bg-red-500/10 border-red-500/20';
    StatusIcon = AlertTriangle;
  } else if (percentage >= 80) {
    statusText = 'Caution Limit';
    statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    StatusIcon = AlertTriangle;
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="apple-card flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Budget Goal
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatMonthLabel(selectedMonthKey)}
            </p>
          </div>
        </div>

        {isCurrentMonth ? (
          <button
            onClick={onOpenSetBudget}
            className="p-2 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Edit monthly budget goal"
          >
            <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
          </button>
        ) : (
          <span className="text-[10px] font-semibold text-neutral-400 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5">
            Past Month
          </span>
        )}
      </div>

      {/* Ring & Stats Container */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
        {/* Apple Watch Ring SVG */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-black/5 dark:stroke-white/10"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              className={
                percentage >= 100
                  ? 'stroke-red-500'
                  : percentage >= 80
                  ? 'stroke-amber-500'
                  : 'stroke-blue-500'
              }
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
              {percentage}%
            </span>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Used</span>
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${statusColor}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </div>

          <div>
            <p className="text-xs text-neutral-400 font-medium">Daily Allowance</p>
            <p className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              ₹{dailyAllowance.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-neutral-400">/ day</span>
            </p>
            {isCurrentMonth ? (
              <p className="text-[11px] text-neutral-400">({daysRemaining} days left this month)</p>
            ) : (
              <p className="text-[11px] text-neutral-400">Past month record</p>
            )}
          </div>

          <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-400 font-medium">Base Budget:</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                ₹{monthlyBudget.toLocaleString('en-IN')}
              </span>
            </div>

            {carryover > 0 && (
              <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Rollover:
                </span>
                <span className="text-xs font-bold">+₹{carryover.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-1 border-t border-dashed border-black/5 dark:border-white/10">
              <span className="text-xs text-neutral-500 font-bold">Total Budget:</span>
              <span className="text-sm font-bold font-display text-neutral-900 dark:text-white">
                ₹{effectiveBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

