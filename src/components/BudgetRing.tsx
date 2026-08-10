'use client';

import { motion } from 'framer-motion';
import { Target, TrendingDown, AlertTriangle, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import type { Expense } from '../types/expense';

interface BudgetRingProps {
  expenses: Expense[];
  monthlyBudget: number;
  onOpenSetBudget: () => void;
}

export function BudgetRing({ expenses, monthlyBudget, onOpenSetBudget }: BudgetRingProps) {
  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const remainingBudget = monthlyBudget - totalSpent;
  const percentage = Math.min(100, Math.max(0, Math.round((totalSpent / monthlyBudget) * 100)));

  // Calculate days remaining in current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  const dailyAllowance = Math.max(0, Math.round(remainingBudget / daysRemaining));

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Budget Goal
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Monthly spending limit</p>
          </div>
        </div>

        <button
          onClick={onOpenSetBudget}
          className="p-2 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Edit monthly budget goal"
        >
          <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

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
              className={percentage >= 100 ? 'stroke-red-500' : percentage >= 80 ? 'stroke-amber-500' : 'stroke-blue-500'}
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
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${statusColor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </div>

          <div>
            <p className="text-xs text-neutral-400 font-medium">Daily Allowance</p>
            <p className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              ₹{dailyAllowance.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-neutral-400">/ day</span>
            </p>
            <p className="text-[11px] text-neutral-400">({daysRemaining} days left this month)</p>
          </div>

          <div className="pt-2 border-t border-black/5 dark:border-white/10">
            <p className="text-xs text-neutral-400 font-medium">Monthly Goal</p>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              ₹{monthlyBudget.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
