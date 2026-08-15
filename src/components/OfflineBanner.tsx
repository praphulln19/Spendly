'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CloudOff, RefreshCw } from 'lucide-react';

/*
 * Silent queueing is worse than no queueing: someone who cannot tell whether a
 * spend was recorded will log it twice. So the state is always visible, and it
 * says what is happening rather than just that something is wrong.
 */

interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount: number;
}

export function OfflineBanner({ isOnline, pendingCount }: OfflineBannerProps) {
  const visible = !isOnline || pendingCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold mb-4 ${
            isOnline
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isOnline ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CloudOff className="w-3.5 h-3.5" />
          )}
          <span>
            {isOnline
              ? `Syncing ${pendingCount} ${pendingCount === 1 ? 'expense' : 'expenses'}…`
              : pendingCount > 0
              ? `Offline — ${pendingCount} ${
                  pendingCount === 1 ? 'expense is' : 'expenses are'
                } saved here and will upload when you reconnect`
              : 'Offline — anything you add is saved here and uploads when you reconnect'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
