'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, LineChart } from 'lucide-react';
import type { Expense } from '../types/expense';

interface AnalyticsBarChartProps {
  expenses: Expense[];
}

export function AnalyticsBarChart({ expenses }: AnalyticsBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  // Graph dimensions
  const width = 300;
  const height = 120;
  const padding = 20;

  // Compute SVG coordinates for each point
  const points = chartData.map((d, index) => {
    const x =
      chartData.length === 1
        ? width / 2
        : padding + (index / (chartData.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.amount / maxAmount) * (height - 2 * padding);
    return { x, y, ...d };
  });

  // Construct SVG path strings
  const pathD =
    points.length > 0
      ? points.reduce((acc, pt, i) => {
          if (i === 0) return `M ${pt.x} ${pt.y}`;
          const prev = points[i - 1];
          const cx1 = prev.x + (pt.x - prev.x) / 2;
          const cy1 = prev.y;
          const cx2 = prev.x + (pt.x - prev.x) / 2;
          const cy2 = pt.y;
          return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
        }, '')
      : '';

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';

  return (
    <div className="apple-card flex flex-col justify-between h-full min-h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <LineChart className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Spending Trends
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Daily activity graph</p>
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
          <p className="text-xs font-medium">Add transactions to generate trend graphs.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-end">
          {/* Smooth SVG Line & Area Graph */}
          <div className="relative w-full h-36">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <motion.path
                d={areaD}
                fill="url(#spendGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />

              {/* Smooth Trend Line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />

              {/* Data Points */}
              {points.map((pt, i) => (
                <g key={pt.date}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? '6' : '4'}
                    className="fill-blue-500 stroke-white dark:stroke-neutral-900 stroke-2 transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltips Overlay */}
            {points.map((pt, i) => (
              <div
                key={`tooltip-${pt.date}`}
                className="absolute transform -translate-x-1/2 cursor-pointer group"
                style={{
                  left: `${(pt.x / width) * 100}%`,
                  top: `${(pt.y / height) * 100}%`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold shadow-lg transition-opacity duration-150 pointer-events-none whitespace-nowrap ${
                    hoveredIndex === i ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  ₹{pt.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Date Axis Labels */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-black/5 dark:border-white/10 mt-2">
            {chartData.map((d, index) => (
              <span
                key={d.date}
                className={`text-[10px] font-bold transition-colors ${
                  hoveredIndex === index
                    ? 'text-blue-500'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
