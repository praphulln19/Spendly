'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { spaceGrotesk } from './fonts';

const WelcomeCanvas = dynamic(() => import('./WelcomeCanvas'), {
  ssr: false,
  loading: () => null,
});

/*
 * Gates the 3D scene's mount (and therefore the dynamic import that fetches
 * three.js/@react-three/*, by far the heaviest JS this route loads) behind an
 * idle callback, so the hero text and CTA paint first instead of competing
 * with that fetch/parse/WebGL-init on the main thread. Safari has no
 * requestIdleCallback, hence the timeout fallback.
 */
function useDeferredMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // `typeof` rather than `'requestIdleCallback' in window`: the DOM lib
    // types it as always present, which makes TS narrow the Safari fallback
    // branch below to `never` if the check is written as an `in` test.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  return ready;
}

function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let id: number | undefined;
    // A background tab has no reason to re-render every second; the interval
    // is dropped on hide and the display catches back up on return.
    const startTicking = () => {
      setTime(format());
      id = window.setInterval(() => setTime(format()), 1000);
    };
    const stopTicking = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const handleVisibility = () => {
      if (document.hidden) stopTicking();
      else startTicking();
    };

    startTicking();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopTicking();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Reserve the width so the clock mounting client-side doesn't shift the layout.
  return <span className="tabular-nums">{time ?? '--:--:--'}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function WelcomeHero() {
  const showCanvas = useDeferredMount();

  return (
    <div className={`${spaceGrotesk.variable} relative min-h-[100svh] w-full overflow-hidden bg-black text-[#f5f5f7]`}>
      {/* Faint structural grid, matching the reference's instrument-panel feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="absolute inset-0">{showCanvas && <WelcomeCanvas />}</div>

      {/* Overlay UI sits above the canvas; pointer-events re-enabled only on interactive bits */}
      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-12 lg:py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em]">
              SPENDLY
            </span>
          </div>
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2.5 text-center text-xs font-medium tracking-wide text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.7)] transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 sm:text-sm"
          >
            Open Spendly
          </Link>
        </header>

        {/* Top-right meta, echoing the reference's small studio stats */}
        <div
          className="pointer-events-none absolute right-5 top-16 hidden text-right text-[10px] uppercase leading-tight tracking-[0.12em] text-white/40 sm:right-8 sm:top-20 sm:block lg:right-12"
          style={{ marginRight: '-0.12em' }}
        >
          <div className="text-white/25">Built for</div>
          <div>Daily budgets</div>
        </div>

        <div className="flex flex-1 flex-col justify-end">
          <div className="flex flex-col gap-8 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-4">
            <motion.h1
              initial="hidden"
              animate="show"
              className="max-w-xl font-[family-name:var(--font-display)] text-[13vw] font-semibold leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl"
            >
              <motion.span custom={0} variants={fadeUp} className="block">
                WHAT CAN I
              </motion.span>
              <motion.span
                custom={0.12}
                variants={fadeUp}
                className="block bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent"
              >
                spend today?
              </motion.span>
            </motion.h1>

            <motion.div
              initial="hidden"
              animate="show"
              custom={0.3}
              variants={fadeUp}
              className="max-w-xs text-left text-sm leading-relaxed text-white/55 sm:text-right"
            >
              <p>
                Spendly turns your budget into one clear number. Set what you have, log spends in two taps, and wake up
                to a fresh number every morning.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.12em] text-white/35">
            <span aria-hidden />
            <span className="hidden font-[family-name:var(--font-display)] text-xs italic normal-case tracking-normal text-white/45 sm:inline">
              &ldquo;Know what you can spend, before you spend it.&rdquo;
            </span>
            <span>
              <LiveClock />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeHero;
