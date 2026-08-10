'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import type { Expense } from '../types/expense';

interface AnalyticsBarChartProps {
  expenses: Expense[];
}

export function AnalyticsBarChart({ expenses }: AnalyticsBarChartProps) {
  // Aggregate expenses by date (last 7 recorded days)
  const dateTotals = expenses.reduce<Record<string, number>>((acc, exp) => {
    const dateKey = exp.date.slice(0, 10);
    acc[dateKey] = (acc[dateKey] || 0) + exp.amount;
    return acc;
  }, {});

  const sortedDates = Object.keys(dateTotals).sort().slice(-7);
  const chartData = sortedDates.map((date) => ({
    date,
    label: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
    amount: dateTotals[date],
  }));

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);
  const totalInPeriod = chartData.reduce((acc, d) => acc + d.amount, 0);
  const avgDaily = chartData.length > 0 ? Math.round(totalInPeriod / chartData.length) : 0;

  return (
    <div className="apple-card flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Spending Trends
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Daily activity analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <span>Avg: ₹{avgDaily.toLocaleString('en-IN')}/day</span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium">Add transactions to generate trend charts.</p>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2 border-b border-black/5 dark:border-white/10">
          {chartData.map((item, index) => {
            const heightPercent = Math.max(12, Math.round((item.amount / maxAmount) * 100));

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip on Hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 apple-glass px-2.5 py-1 rounded-xl text-[11px] font-bold text-neutral-900 dark:text-white shadow-lg whitespace-nowrap">
                  ₹{item.amount.toLocaleString('en-IN')}
                </div>

                {/* Animated Column Bar */}
                <div className="w-full max-w-[36px] bg-black/5 dark:bg-white/5 rounded-2xl flex items-end h-full p-1 overflow-hidden">
                  <motion.div
                    className="w-full bg-neutral-900 dark:bg-white rounded-xl group-hover:bg-blue-500 transition-colors duration-200"
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                  />
                </div>

                <span className="text-[11px] font-semibold text-neutral-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
