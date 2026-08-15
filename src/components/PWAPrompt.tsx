'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, CheckCircle2 } from 'lucide-react';
import { SpendlyMark } from './SpendlyMark';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 1. Check if device is Mobile (phones / tablets)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const mobileCheck =
      /iphone|ipad|ipod|android|blackberry|iemobile|opera mini|mobile/i.test(userAgent) ||
      window.innerWidth < 768;

    setIsMobile(mobileCheck);

    // If not mobile, do not initialize or show PWA prompt on desktop!
    if (!mobileCheck) {
      return;
    }

    // 2. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Spendly ServiceWorker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Spendly ServiceWorker registration failed:', err);
        });
    }

    // 3. Check if already running in standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      return;
    }

    // 4. Check for iOS device
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 5. Check if dismissed recently
    const lastDismissed = localStorage.getItem('spendly_pwa_prompt_dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < threeDaysInMs) {
        return;
      }
    }

    // 6. Listen for beforeinstallprompt event (Android / Chrome Mobile)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS Safari on mobile, show iOS prompt after 3s
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalled(true);
        setShowPrompt(false);
      }
    } catch (err) {
      console.warn('Installation error:', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('spendly_pwa_prompt_dismissed', Date.now().toString());
  };

  // Only render on mobile devices and when prompt is triggered
  if (!isMobile || !showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-[100]"
      >
        <div className="apple-glass rounded-3xl p-4 shadow-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md shrink-0">
                <SpendlyMark className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold font-display text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span>{isIOS ? 'Add Spendly to Home Screen' : 'Install Spendly App'}</span>
                  {installed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Fast offline access & native app experience
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Close prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Instructions / Actions */}
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10">
            {isIOS ? (
              // iOS Specific Guidance
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  <Share className="w-4 h-4 shrink-0" />
                  <span>
                    Tap the <strong>Share</strong> button in Safari, then select <strong>'Add to Home Screen'</strong>.
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-xs font-bold rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  >
                    Got It
                  </button>
                </div>
              </div>
            ) : (
              // Android Direct Install Action
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Later
                </button>

                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
