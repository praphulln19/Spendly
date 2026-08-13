'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, LineChart } from 'lucide-react';
import type { Expense } from '../types/expense';
import { getMonthKey, getExpensesForMonth, formatMonthLabel } from '../utils/budgetUtils';

interface AnalyticsBarChartProps {
  expenses: Expense[];
  selectedMonthKey?: string;
}

export function AnalyticsBarChart({
  expenses,
  selectedMonthKey = getMonthKey(new Date()),
}: AnalyticsBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const monthExpenses = getExpensesForMonth(expenses, selectedMonthKey);

  // Aggregate expenses by date
  const dateTotals = monthExpenses.reduce<Record<string, number>>((acc, exp) => {
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

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 100);
  const totalInPeriod = chartData.reduce((acc, d) => acc + d.amount, 0);
  const avgDaily = chartData.length > 0 ? Math.round(totalInPeriod / chartData.length) : 0;

  // Graph canvas dimensions & paddings
  const width = 340;
  const height = 160;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 15;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Compute SVG coordinates for each point
  const points = chartData.map((d, index) => {
    const x =
      chartData.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.amount / maxAmount) * chartHeight;
    return { x, y, ...d };
  });

  // Construct straight line path (M x0 y0 L x1 y1 L x2 y2 ...)
  const linePathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Grid line Y values
  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => ({
    ratio,
    val: Math.round(maxAmount * ratio),
    y: paddingTop + chartHeight - ratio * chartHeight,
  }));

  return (
    <div className="apple-card flex flex-col justify-between h-full min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <LineChart className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Spending Trends
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Daily activity graph</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <TrendingUp className="w-3.5 h-3.5" />
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
          {/* Grid & Line Graph SVG */}
          <div className="relative w-full h-44">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Arrowhead marker for Y-axis (Up) */}
                <marker
                  id="arrowUp"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 10 L 5 0 L 10 10 Z" fill="#666666" />
                </marker>

                {/* Arrowhead marker for X-axis (Right) */}
                <marker
                  id="arrowRight"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 Z" fill="#666666" />
                </marker>
              </defs>

              {/* Background Grid Lines (Horizontal & Vertical) */}
              {yTicks.map((tick) => (
                <line
                  key={`y-grid-${tick.ratio}`}
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={width - 10}
                  y2={tick.y}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth="1"
                  strokeDasharray={tick.ratio === 0 ? undefined : '2 2'}
                />
              ))}

              {points.map((pt) => (
                <line
                  key={`x-grid-${pt.date}`}
                  x1={pt.x}
                  y1={paddingTop}
                  x2={pt.x}
                  y2={height - paddingBottom}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              ))}

              {/* Main Y-Axis Line (Vertical with Arrow) */}
              <line
                x1={paddingLeft}
                y1={height - paddingBottom + 5}
                x2={paddingLeft}
                y2={5}
                stroke="#666666"
                strokeWidth="2.5"
                markerEnd="url(#arrowUp)"
              />

              {/* Main X-Axis Line (Horizontal with Arrow) */}
              <line
                x1={paddingLeft - 5}
                y1={height - paddingBottom}
                x2={width - 5}
                y2={height - paddingBottom}
                stroke="#666666"
                strokeWidth="2.5"
                markerEnd="url(#arrowRight)"
              />

              {/* Y-Axis Numerical Labels */}
              {yTicks.map((tick) => (
                <text
                  key={`y-text-${tick.ratio}`}
                  x={paddingLeft - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="text-[9px] font-bold fill-neutral-500 dark:fill-neutral-400 font-mono"
                >
                  {tick.val >= 1000 ? `${(tick.val / 1000).toFixed(1)}k` : tick.val}
                </text>
              ))}

              {/* X-Axis Date Ticks */}
              {points.map((pt) => (
                <text
                  key={`x-text-${pt.date}`}
                  x={pt.x}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-neutral-500 dark:fill-neutral-400"
                >
                  {pt.label}
                </text>
              ))}

              {/* Connecting Trend Line */}
              <motion.path
                d={linePathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
              />

              {/* Data Point Nodes (Circular rings matching user image) */}
              {points.map((pt, i) => (
                <g key={`point-${pt.date}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? '7' : '5.5'}
                    fill="#ffffff"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    className="transition-all duration-150 cursor-pointer shadow-md"
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
                className="absolute transform -translate-x-1/2 cursor-pointer"
                style={{
                  left: `${(pt.x / width) * 100}%`,
                  top: `${(pt.y / height) * 100}%`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] font-extrabold shadow-xl transition-all duration-150 pointer-events-none whitespace-nowrap z-30 ${
                    hoveredIndex === i ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                >
                  ₹{pt.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
