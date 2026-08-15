'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { DayCell } from '../utils/allowance';
import { parseISODate } from '../utils/allowance';
import { formatMoney } from '../utils/format';

/*
 * One cell per day of the budget period.
 *
 * Height is how much of that day's own allowance was spent, so the strip is a
 * record of pace rather than of raw amounts -- a ₹300 day under a ₹800 allowance
 * reads as restraint, the same ₹300 under a ₹200 allowance reads as an overrun.
 * Seeing three tall cells in a row is the explanation for why today's number
 * came out low, which is the part of the rollover people otherwise have to take
 * on faith.
 */

interface DayStripProps {
  cells: DayCell[];
}

const MIN_VISIBLE = 0.06;

export function DayStrip({ cells }: DayStripProps) {
  const reduceMotion = useReducedMotion();
  if (cells.length === 0) return null;

  return (
    <div>
      <div className="flex items-end gap-[3px] h-16" role="img" aria-label="Daily spending pace across this budget period">
        {cells.map((cell, index) => {
          const overrun = cell.ratio > 1;
          const height = Math.max(MIN_VISIBLE, Math.min(1, cell.ratio));

          const tone =
            cell.state === 'future'
              ? 'bg-black/[0.07] dark:bg-white/[0.09]'
              : overrun
              ? 'bg-red-500'
              : cell.state === 'today'
              ? 'bg-blue-500'
              : 'bg-neutral-900 dark:bg-white';

          return (
            <div
              key={cell.date}
              className="group relative flex-1 h-full flex items-end min-w-[3px]"
              title={`${parseISODate(cell.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })} — ${formatMoney(cell.spent)} of ${formatMoney(cell.budget)}`}
            >
              {/* Track: the day's full allowance */}
              <div className="absolute inset-x-0 bottom-0 h-full rounded-[2px] bg-black/[0.04] dark:bg-white/[0.05]" />

              <motion.div
                className={`relative w-full rounded-[2px] ${tone} ${
                  cell.state === 'today' ? 'ring-2 ring-blue-500/30' : ''
                }`}
                initial={reduceMotion ? false : { height: 0 }}
                animate={{ height: `${height * 100}%` }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : Math.min(index * 0.012, 0.4),
                  ease: 'easeOut',
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] font-semibold text-neutral-400">
        <span>{parseISODate(cells[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        <span className="text-neutral-300 dark:text-neutral-600">each bar is one day&apos;s pace</span>
        <span>
          {parseISODate(cells[cells.length - 1].date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>
    </div>
  );
}
