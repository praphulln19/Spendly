'use client';

import { AlertTriangle, CheckCircle2, Info, Sparkles, TrendingDown } from 'lucide-react';
import type { BudgetMessage, BudgetTone } from '../utils/allowance';

/*
 * One sentence on where the budget stands, in the tone the situation deserves.
 *
 * Every state carries an icon and a word as well as a colour, so the meaning
 * survives for anyone who cannot separate the red from the green.
 */

const TONES: Record<
  BudgetTone,
  { wrap: string; icon: typeof AlertTriangle; iconTone: string; title: string }
> = {
  critical: {
    wrap: 'bg-red-500/10 border-red-500/20',
    icon: AlertTriangle,
    iconTone: 'text-red-500',
    title: 'text-red-600 dark:text-red-400',
  },
  warning: {
    wrap: 'bg-orange-500/10 border-orange-500/20',
    icon: TrendingDown,
    iconTone: 'text-orange-500',
    title: 'text-orange-600 dark:text-orange-400',
  },
  caution: {
    wrap: 'bg-amber-500/10 border-amber-500/20',
    icon: AlertTriangle,
    iconTone: 'text-amber-500',
    title: 'text-amber-600 dark:text-amber-400',
  },
  good: {
    wrap: 'bg-emerald-500/10 border-emerald-500/20',
    icon: CheckCircle2,
    iconTone: 'text-emerald-500',
    title: 'text-emerald-600 dark:text-emerald-400',
  },
  great: {
    wrap: 'bg-emerald-500/10 border-emerald-500/20',
    icon: Sparkles,
    iconTone: 'text-emerald-500',
    title: 'text-emerald-600 dark:text-emerald-400',
  },
  neutral: {
    wrap: 'bg-black/[0.04] dark:bg-white/[0.06] border-black/5 dark:border-white/10',
    icon: Info,
    iconTone: 'text-neutral-400',
    title: 'text-neutral-700 dark:text-neutral-300',
  },
};

export function BudgetAlert({ message }: { message: BudgetMessage }) {
  const tone = TONES[message.tone];
  const Icon = tone.icon;

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${tone.wrap}`} role="status">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone.iconTone}`} />
      <div className="min-w-0">
        <p className={`text-sm font-bold leading-snug ${tone.title}`}>{message.title}</p>
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
          {message.detail}
        </p>
      </div>
    </div>
  );
}
