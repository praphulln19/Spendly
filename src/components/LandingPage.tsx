'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Moon, ShieldCheck, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeProvider';
import { SpendlyMark } from './SpendlyMark';
import { DayStrip } from './DayStrip';
import { addDays, todayISO, type DayCell } from '../utils/allowance';

/*
 * The signed-out page.
 *
 * It leads with the number the product exists to produce, and with the day strip
 * underneath it, because the strip is the argument: you can see the heavy days
 * and see why today came out where it did. Everything else is three sentences
 * and the way in.
 */

/** Illustrative period: a month where two heavy days pulled the daily figure down. */
const DEMO_RATIOS = [
  0.6, 0.35, 0.9, 1.35, 0.45, 0.2, 0.75, 0.5, 1.5, 0.3, 0.65, 0.8, 1.2, 0.55, 0.42,
];
const DEMO_TODAY_INDEX = 14;

function buildDemoCells(): DayCell[] {
  const start = addDays(todayISO(), -DEMO_TODAY_INDEX);
  return Array.from({ length: 31 }, (_, index) => {
    const ratio = DEMO_RATIOS[index] ?? 0;
    const state: DayCell['state'] =
      index === DEMO_TODAY_INDEX ? 'today' : index < DEMO_TODAY_INDEX ? 'past' : 'future';
    return {
      date: addDays(start, index),
      budget: 261,
      spent: Math.round(261 * ratio),
      ratio: state === 'future' ? 0 : ratio,
      state,
    };
  });
}

const POINTS = [
  {
    title: 'It recalculates every morning',
    body: 'Spend less today and tomorrow goes up. Spend more and it comes down to cover the difference. Nothing is carried by hand.',
  },
  {
    title: 'Logging takes two taps',
    body: 'Amount on a keypad, category, done. It saves on your device first, so a bad signal at the counter costs you nothing.',
  },
  {
    title: 'Budgets follow your money, not the calendar',
    body: 'Set an amount and the day it has to last until. A month, a week, or until the allowance lands on the fifth.',
  },
];

export function LandingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(provider);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign-in failed. Please try again.');
      setLoading(null);
    }
  };

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: 'easeOut' as const },
        };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black">
      <header className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
            <SpendlyMark className="w-5 h-5" />
          </div>
          <span className="text-lg font-black font-display tracking-tight text-neutral-900 dark:text-white">
            Spendly
          </span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-transform"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        {/* The thesis, stated as the number itself */}
        <motion.section {...rise(0)} className="pt-10 sm:pt-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400 mb-4">
            Day 15 of 31
          </p>
          <h1 className="font-display font-black tabular-nums leading-[0.9] tracking-[-0.045em] text-[4rem] sm:text-[5.5rem] text-neutral-900 dark:text-white">
            <span className="mr-1">₹</span>151
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            left to spend today
          </p>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400 max-w-lg leading-relaxed">
            Most expense trackers tell you what you already spent. Spendly divides what you have
            across the days it has to cover, and tells you what today is actually worth.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold mt-6 max-w-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mt-7">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading !== null}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading === 'google' ? 'Redirecting…' : 'Continue with Google'}</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading !== null}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-black/5 dark:bg-white/10 text-neutral-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-black/10 dark:hover:bg-white/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>{loading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}</span>
            </button>
          </div>

          <p className="mt-4 text-xs text-neutral-400 font-medium">
            No password to set. Nothing to fill in.
          </p>
        </motion.section>

        {/* The mechanism, shown rather than described */}
        <motion.section {...rise(0.12)} className="mt-10 apple-card">
          <DayStrip cells={buildDemoCells()} />
          <p className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Every bar is one day, sized by how much of that day&apos;s own allowance it used. The two
            red days are why today came out at ₹151 instead of ₹261 — and why easing off now lifts
            tomorrow.
          </p>
        </motion.section>

        <motion.section {...rise(0.2)} className="mt-10 grid gap-px bg-black/5 dark:bg-white/10 rounded-3xl overflow-hidden">
          {POINTS.map((point) => (
            <div key={point.title} className="bg-[#f5f5f7] dark:bg-black p-5 sm:p-6">
              <h2 className="text-sm font-bold font-display text-neutral-900 dark:text-white mb-1.5">
                {point.title}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl">
                {point.body}
              </p>
            </div>
          ))}
        </motion.section>

        <motion.section
          {...rise(0.28)}
          className="mt-10 pt-6 border-t border-black/5 dark:border-white/10"
        >
          <p className="inline-flex items-start gap-2 text-xs text-neutral-400 font-medium max-w-lg leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            Your expenses are readable only by your own account. That rule is enforced by the
            database itself, not just the app.
          </p>
        </motion.section>
      </main>
    </div>
  );
}
