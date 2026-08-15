'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useSession } from '../context/SessionProvider';
import { useExpenseStore } from '../hooks/useExpenses';
import { nextPeriodAfter } from '../utils/allowance';
import { AppleNavbar } from './AppleNavbar';
import { LandingPage } from './LandingPage';
import { MobileBottomNav } from './MobileBottomNav';
import { QuickAddSheet } from './QuickAddSheet';
import { PeriodSetupModal } from './PeriodSetupModal';
import { OfflineBanner } from './OfflineBanner';

/*
 * Session gating, chrome and the two global sheets, in one place. Each page used
 * to carry its own copy of the auth bootstrap and modal wiring, which is how the
 * two pages drifted into disagreeing about the budget they displayed.
 */

type AppChrome = {
  openAddExpense: () => void;
  openBudget: () => void;
};

const AppChromeContext = createContext<AppChrome>({ openAddExpense: () => {}, openBudget: () => {} });

export function useAppChrome() {
  return useContext(AppChromeContext);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  const {
    allowance,
    currentPeriod,
    lastEndedPeriod,
    isOnline,
    pendingCount,
    add,
    startPeriod,
    editPeriod,
    stash,
  } = useExpenseStore();

  const [addOpen, setAddOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const chrome = useMemo<AppChrome>(
    () => ({ openAddExpense: () => setAddOpen(true), openBudget: () => setBudgetOpen(true) }),
    []
  );

  // The installed-app shortcut launches /?add=1 so logging a spend skips the app
  // entirely. Read from location rather than useSearchParams to keep these pages
  // statically prerenderable.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('add') === '1') {
      setAddOpen(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f5f5f7] dark:bg-black text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-bold font-display tracking-tight">Opening Spendly…</p>
      </div>
    );
  }

  // Signed out, the app is the landing page.
  if (!session) return <LandingPage />;

  // When the current budget has lapsed, prefill the next one with the same shape.
  const suggestedNext =
    !currentPeriod && lastEndedPeriod ? nextPeriodAfter(lastEndedPeriod) : null;

  return (
    <AppChromeContext.Provider value={chrome}>
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-black pb-24 sm:pb-16">
        <AppleNavbar session={session} allowance={allowance} onOpenAddExpense={chrome.openAddExpense} />

        <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
          <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
          {children}
        </main>

        <MobileBottomNav onOpenAddExpense={chrome.openAddExpense} />

        <QuickAddSheet
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={add}
          todayBudget={allowance?.todayBudget ?? 0}
        />

        <PeriodSetupModal
          isOpen={budgetOpen}
          onClose={() => setBudgetOpen(false)}
          existing={currentPeriod}
          initial={suggestedNext}
          onSubmit={async (period) => {
            if (currentPeriod) await editPeriod(currentPeriod.id, period);
            else await startPeriod(period);
          }}
          onStash={currentPeriod ? stash : undefined}
        />
      </div>
    </AppChromeContext.Provider>
  );
}
