'use client';

import { motion } from 'framer-motion';
import type { Expense, ExpenseCategory } from '../types/expense';
import { formatMoney } from './SummaryCards';
import {
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
  Layers,
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

interface GlassCategoryBreakdownProps {
  expenses: Expense[];
}

export function GlassCategoryBreakdown({ expenses }: GlassCategoryBreakdownProps) {
  const categoryTotals = Object.entries(
    expenses.reduce<Record<string, number>>((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  )
    .map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const maxAmount = categoryTotals.length > 0 ? categoryTotals[0].amount : 1;

  return (
    <div className="apple-card flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Category Breakdown
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Expense distribution</p>
          </div>
        </div>
        <span className="apple-badge">{categoryTotals.length} Categories</span>
      </div>

      {categoryTotals.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-xs font-medium">No category spending recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryTotals.slice(0, 5).map(({ category, amount }, idx) => {
            const Icon = categoryIcons[category] || CircleEllipsis;
            const percentage = Math.max(6, Math.round((amount / maxAmount) * 100));

            return (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {category}
                    </span>
                  </div>
                  <span className="font-bold font-display text-neutral-900 dark:text-white">
                    {formatMoney(amount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neutral-900 dark:bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
