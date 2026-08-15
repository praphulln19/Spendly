'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Wallet } from 'lucide-react';
import type { Allowance } from '../utils/allowance';
import { buildBudgetMessage, buildDayStrip, formatPeriodLabel } from '../utils/allowance';
import type { Expense } from '../types/expense';
import { formatMoney } from '../utils/format';
import { DayStrip } from './DayStrip';
import { BudgetAlert } from './BudgetAlert';

interface TodayHeroProps {
  allowance: Allowance | null;
  expenses: Expense[];
  onSetBudget: () => void;
}

/**
 * The one screen the app exists for: what can I spend right now.
 *
 * The figure itself stays in the text colour at every status except an actual
 * overrun -- an authoritative number people trust beats a number that changes
 * colour to editorialise. State is carried by the strip and the status line
 * underneath instead.
 */
export function TodayHero({ allowance, expenses, onSetBudget }: TodayHeroProps) {
  const reduceMotion = useReducedMotion();

  if (!allowance) {
    return (
      <section className="apple-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3">
          No budget running
        </p>
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white max-w-md">
          Set what you have, and when it has to last.
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
          Spendly divides what is left across the days remaining, then recalculates every
          morning based on what you actually spent.
        </p>
        <button onClick={onSetBudget} className="btn-primary mt-5">
          <Wallet className="w-4 h-4" />
          <span>Set your budget</span>
        </button>
      </section>
    );
  }

  const { phase, todayLeft, todayBudget, spentToday, remaining } = allowance;
  const isOver = todayLeft < 0;
  const cells = buildDayStrip(allowance.period, expenses);
  const message = buildBudgetMessage(allowance);

  if (phase === 'upcoming') {
    return (
      <section className="apple-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3">
          Starts {formatPeriodLabel(allowance.period).split('–')[0].trim()}
        </p>
        <h1 className="text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          {formatMoney(todayBudget)} <span className="text-neutral-400 font-bold">a day</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          That is what {formatMoney(allowance.spendable)} works out to across{' '}
          {allowance.daysTotal} days.
        </p>
      </section>
    );
  }

  if (phase === 'ended') {
    return (
      <section className="apple-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3">
          Budget ended · {formatPeriodLabel(allowance.period)}
        </p>
        <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tighter tabular-nums text-neutral-900 dark:text-white">
          {formatMoney(Math.abs(remaining))}
        </h1>
        <p className="mt-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          {remaining >= 0 ? 'left over at the end' : 'over budget by the end'}
        </p>
        <div className="mt-6">
          <DayStrip cells={cells} />
        </div>
        <button onClick={onSetBudget} className="btn-primary mt-6">
          <span>Start the next budget</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    );
  }

  return (
    <section className="apple-card">
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
          Day {allowance.dayIndex} of {allowance.daysTotal}
        </p>
        <p className="text-xs font-semibold text-neutral-400 tabular-nums">
          {formatPeriodLabel(allowance.period)}
        </p>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div
          className={`font-display font-black tabular-nums leading-[0.9] tracking-[-0.045em] text-[3.75rem] sm:text-[5rem] ${
            isOver ? 'text-red-500' : 'text-neutral-900 dark:text-white'
          }`}
        >
          <span className="mr-1">₹</span>
          {Math.round(Math.abs(todayLeft)).toLocaleString('en-IN')}
        </div>

        <p className="mt-1.5 text-sm font-bold text-neutral-500 dark:text-neutral-400">
          {isOver ? 'over today' : 'left to spend today'}
          <span className="font-medium text-neutral-400">
            {' '}· of {formatMoney(todayBudget)}
          </span>
        </p>
      </motion.div>

      <div className="mt-7">
        <DayStrip cells={cells} />
      </div>

      <div className="mt-5">
        <BudgetAlert message={message} />
      </div>

      <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-x-5 gap-y-1 text-xs">
        <span className="text-neutral-400 font-medium tabular-nums">
          Spent today {formatMoney(spentToday)}
        </span>
        <span className="text-neutral-400 font-medium tabular-nums">
          {formatMoney(remaining)} left of {formatMoney(allowance.spendable)}
        </span>
      </div>
    </section>
  );
}
