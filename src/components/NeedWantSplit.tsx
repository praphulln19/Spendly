'use client';

import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import type { Expense } from '../types/expense';
import { formatDaysOfAllowance } from '../utils/allowance';
import { formatMoney } from '../utils/format';

/*
 * Needs and wants, priced in days rather than rupees.
 *
 * "₹2,400 on wants" is an abstraction; "six days of allowance on wants" is the
 * same fact in the unit the rest of the app has already taught you to think in,
 * and it is the one that actually changes behaviour.
 */

interface NeedWantSplitProps {
  expenses: Expense[];
  todayBudget: number;
  label?: string;
}

export function NeedWantSplit({ expenses, todayBudget, label = 'this budget' }: NeedWantSplitProps) {
  const needs = expenses.filter((exp) => exp.type === 'Need').reduce((sum, exp) => sum + exp.amount, 0);
  const wants = expenses.filter((exp) => exp.type === 'Want').reduce((sum, exp) => sum + exp.amount, 0);
  const total = needs + wants;

  const needsShare = total > 0 ? (needs / total) * 100 : 0;

  return (
    <div className="apple-card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
          <Scale className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
            Needs vs wants
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Measured in days, {label}</p>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-xs font-medium text-neutral-400 py-8 text-center">
          Nothing logged yet for this stretch.
        </p>
      ) : (
        <>
          <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-black/5 dark:bg-white/10 mb-5">
            <motion.div
              className="bg-emerald-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${needsShare}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.div
              className="bg-amber-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${100 - needsShare}%` }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Needs', amount: needs, tone: 'text-emerald-500' },
              { name: 'Wants', amount: wants, tone: 'text-amber-500' },
            ].map((row) => (
              <div key={row.name}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${row.tone}`}>
                  {row.name}
                </p>
                <p className="text-xl font-black font-display tabular-nums tracking-tight text-neutral-900 dark:text-white mt-0.5">
                  {formatMoney(row.amount)}
                </p>
                <p className="text-[11px] font-semibold text-neutral-400 tabular-nums">
                  {formatDaysOfAllowance(row.amount, todayBudget)} of allowance
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
