'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LineChart, ReceiptText, Plus, Wallet } from 'lucide-react';

/*
 * A touch tab bar, not a macOS dock.
 *
 * The previous implementation magnified icons under the pointer and revealed
 * labels on hover -- neither of which exists on a phone, so it rendered as four
 * unlabelled circles. This uses the same frosted-glass treatment as the desktop
 * navbar, keeps labels permanently visible, and gives the one action on the bar
 * the same solid black treatment every other primary button in the app has.
 */

const DESTINATIONS = [
  { href: '/', label: 'Today', icon: Wallet },
  { href: '/insights', label: 'Insights', icon: LineChart },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
] as const;

interface MobileBottomNavProps {
  onOpenAddExpense?: () => void;
}

export function MobileBottomNav({ onOpenAddExpense }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-4 pointer-events-none">
      <nav
        className="apple-glass rounded-[26px] mx-auto w-fit max-w-full flex items-center gap-1 p-1.5 pointer-events-auto"
        aria-label="Primary"
      >
        {DESTINATIONS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 w-[68px] py-2 rounded-[18px] transition-colors active:scale-95 duration-150"
            >
              {active && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute inset-0 rounded-[18px] bg-black/[0.07] dark:bg-white/[0.12]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                className={`relative w-[18px] h-[18px] ${
                  active ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              />
              <span
                className={`relative text-[10px] font-bold tracking-tight ${
                  active ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {onOpenAddExpense && (
          <>
            <span className="w-px h-8 bg-black/10 dark:bg-white/15 mx-0.5" aria-hidden="true" />
            <button
              onClick={onOpenAddExpense}
              aria-label="Add expense"
              className="w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform duration-150"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
