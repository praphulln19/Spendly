'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAddExpense?: () => void;
}

export function MobileBottomNav({ onOpenAddExpense }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="apple-glass rounded-full p-2 flex items-center justify-center gap-2.5 shadow-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-3xl">
        {/* Dashboard Squircle */}
        <Link
          href="/"
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
            pathname === '/'
              ? 'bg-black/10 dark:bg-white/15 text-neutral-900 dark:text-white font-bold shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          aria-label="Dashboard"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-tight">Dashboard</span>
        </Link>

        {/* Plus Button Squircle */}
        {onOpenAddExpense && (
          <button
            onClick={onOpenAddExpense}
            className="w-14 h-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:opacity-90 shrink-0"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Expenses Squircle */}
        <Link
          href="/expenses"
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
            pathname === '/expenses'
              ? 'bg-black/10 dark:bg-white/15 text-neutral-900 dark:text-white font-bold shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          aria-label="Expenses"
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-tight">Expenses</span>
        </Link>
      </div>
    </div>
  );
}
