'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

/*
 * The app had no error boundary at all, so anything thrown while rendering --
 * or from inside an effect, which is how a browser with site data blocked used
 * to take the install prompt down -- reached Next's bare production error page.
 *
 * Recovery matters more than the message here: expenses logged offline live in
 * localStorage until they sync, so someone who hits this needs a way back into
 * the app rather than a dead end that invites them to clear site data.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Spendly crashed:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#f5f5f7] dark:bg-black">
      <div>
        <h1 className="text-xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 max-w-xs">
          Nothing you have logged is lost. Try again, and it should pick up where it left off.
        </p>
      </div>

      <button onClick={reset} className="btn-primary">
        <RefreshCw className="w-4 h-4" />
        <span>Try again</span>
      </button>

      {error.digest && (
        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600">
          {error.digest}
        </p>
      )}
    </div>
  );
}
