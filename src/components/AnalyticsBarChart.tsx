'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, LineChart } from 'lucide-react';
import type { Expense } from '../types/expense';
import { getMonthKey, getExpensesForMonth } from '../utils/budgetUtils';
import { formatMoney } from '../utils/format';

/*
 * Daily spend, split into needs and wants.
 *
 * A single line could show the daily total but not what it was made of, which is
 * the question worth asking of a spending history. Stacked bars answer both: bar
 * height is the day, and the split says how much of it was discretionary.
 *
 * Colours are validated for both themes (OKLCH lightness band, chroma floor,
 * CVD separation ΔE 10.1, ≥3:1 against both surfaces), so one pair serves light
 * and dark. Needs always sit on the bottom, so position encodes identity too and
 * the chart never relies on colour alone.
 */

const NEED_COLOR = '#059669';
const WANT_COLOR = '#ea580c';

interface AnalyticsBarChartProps {
  expenses: Expense[];
  selectedMonthKey?: string;
}

/** Rect with only its top corners rounded, so bars stay anchored to the baseline. */
function topRoundedPath(x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.max(0, Math.min(radius, height, width / 2));
  return `M ${x} ${y + height} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + width - r} ${y} Q ${
    x + width
  } ${y} ${x + width} ${y + r} L ${x + width} ${y + height} Z`;
}

export function AnalyticsBarChart({
  expenses,
  selectedMonthKey = getMonthKey(new Date()),
}: AnalyticsBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const monthExpenses = getExpensesForMonth(expenses, selectedMonthKey);

  const byDate = monthExpenses.reduce<Record<string, { need: number; want: number }>>((acc, exp) => {
    const day = exp.date.slice(0, 10);
    if (!acc[day]) acc[day] = { need: 0, want: 0 };
    if (exp.type === 'Want') acc[day].want += exp.amount;
    else acc[day].need += exp.amount;
    return acc;
  }, {});

  const chartData = Object.keys(byDate)
    .sort()
    .slice(-7)
    .map((date) => ({
      date,
      label: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
      need: byDate[date].need,
      want: byDate[date].want,
      total: byDate[date].need + byDate[date].want,
    }));

  const maxAmount = Math.max(...chartData.map((d) => d.total), 100);
  const periodTotal = chartData.reduce((sum, d) => sum + d.total, 0);
  const avgDaily = chartData.length > 0 ? Math.round(periodTotal / chartData.length) : 0;

  const width = 340;
  const height = 180;
  const padLeft = 42;
  const padBottom = 30;
  const padTop = 14;
  const padRight = 10;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const baseline = padTop + chartHeight;

  const slot = chartData.length > 0 ? chartWidth / chartData.length : chartWidth;
  const barWidth = Math.min(26, slot * 0.6);

  const yTicks = [0, 0.5, 1].map((ratio) => ({
    ratio,
    value: Math.round(maxAmount * ratio),
    y: baseline - ratio * chartHeight,
  }));

  const bars = chartData.map((d, index) => {
    const x = padLeft + slot * index + (slot - barWidth) / 2;
    const needHeight = (d.need / maxAmount) * chartHeight;
    const wantHeight = (d.want / maxAmount) * chartHeight;
    // 2px of surface between the two fills so the boundary reads without a stroke
    const gap = d.need > 0 && d.want > 0 ? 2 : 0;
    return { ...d, index, x, needHeight, wantHeight, gap };
  });

  return (
    <div className="apple-card flex flex-col h-full min-h-[300px]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <LineChart className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Spending Trends
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Daily needs and wants</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 shrink-0">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="tabular-nums">Avg {formatMoney(avgDaily)}/day</span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 my-auto">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium">Add expenses to see the daily split.</p>
        </div>
      ) : (
        <>
          <div className="relative w-full flex-1 min-h-[180px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* Recessive grid */}
              {yTicks.map((tick) => (
                <line
                  key={`grid-${tick.ratio}`}
                  x1={padLeft}
                  y1={tick.y}
                  x2={width - padRight}
                  y2={tick.y}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth="1"
                  strokeDasharray={tick.ratio === 0 ? undefined : '2 3'}
                />
              ))}

              {yTicks.map((tick) => (
                <text
                  key={`ylabel-${tick.ratio}`}
                  x={padLeft - 8}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  className="text-[9px] font-bold fill-neutral-400"
                >
                  {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(1)}k` : tick.value}
                </text>
              ))}

              {bars.map((bar) => {
                const wantY = baseline - bar.needHeight - bar.gap - bar.wantHeight;
                const needY = baseline - bar.needHeight;
                const dimmed = hoveredIndex !== null && hoveredIndex !== bar.index;

                return (
                  <g
                    key={bar.date}
                    opacity={dimmed ? 0.4 : 1}
                    className="transition-opacity duration-150"
                  >
                    {/* Needs sit on the baseline; wants stack above */}
                    {bar.need > 0 && (
                      <motion.path
                        d={topRoundedPath(bar.x, needY, barWidth, bar.needHeight, 4)}
                        fill={NEED_COLOR}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: bar.index * 0.04 }}
                      />
                    )}
                    {bar.want > 0 && (
                      <motion.path
                        d={topRoundedPath(bar.x, wantY, barWidth, bar.wantHeight, 4)}
                        fill={WANT_COLOR}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: bar.index * 0.04 + 0.05 }}
                      />
                    )}

                    {/* Hit target is the whole column, not the mark */}
                    <rect
                      x={padLeft + slot * bar.index}
                      y={padTop}
                      width={slot}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(bar.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                );
              })}

              {bars.map((bar) => (
                <text
                  key={`xlabel-${bar.date}`}
                  x={bar.x + barWidth / 2}
                  y={height - padBottom + 15}
                  textAnchor="middle"
                  className={`text-[9px] font-bold ${
                    hoveredIndex === bar.index ? 'fill-neutral-900 dark:fill-white' : 'fill-neutral-400'
                  }`}
                >
                  {bar.label}
                </text>
              ))}
            </svg>

            {/* Tooltip */}
            {bars.map((bar) => (
              <div
                key={`tip-${bar.date}`}
                className={`absolute -translate-x-1/2 pointer-events-none z-20 transition-opacity duration-150 ${
                  hoveredIndex === bar.index ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${((bar.x + barWidth / 2) / width) * 100}%`,
                  top: `${((baseline - bar.needHeight - bar.gap - bar.wantHeight) / height) * 100}%`,
                }}
              >
                <div className="-translate-y-[calc(100%+8px)] px-2.5 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xl whitespace-nowrap">
                  <div className="text-[11px] font-extrabold tabular-nums">{formatMoney(bar.total)}</div>
                  <div className="text-[9px] font-semibold opacity-70 tabular-nums">
                    {formatMoney(bar.need)} need · {formatMoney(bar.want)} want
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend — identity never rests on colour alone */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5 dark:border-white/10">
            {[
              { label: 'Needs', color: NEED_COLOR },
              { label: 'Wants', color: WANT_COLOR },
            ].map((series) => (
              <span
                key={series.label}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-400"
              >
                <span
                  className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                  style={{ backgroundColor: series.color }}
                />
                {series.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
