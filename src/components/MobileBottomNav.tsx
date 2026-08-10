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
    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
      <div className="apple-glass rounded-3xl p-1.5 flex items-center justify-between shadow-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-3xl">
        {/* Dashboard Tab */}
        <Link
          href="/"
          className={`flex-1 h-12 flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all ${
            pathname === '/'
              ? 'text-black dark:text-white bg-black/5 dark:bg-white/10 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Dashboard</span>
        </Link>

        {/* Center Floating Plus Button */}
        {onOpenAddExpense && (
          <div className="px-2 shrink-0">
            <button
              onClick={onOpenAddExpense}
              className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Add Expense"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Expenses Tab */}
        <Link
          href="/expenses"
          className={`flex-1 h-12 flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all ${
            pathname === '/expenses'
              ? 'text-black dark:text-white bg-black/5 dark:bg-white/10 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span className="text-[10px]">Expenses</span>
        </Link>
      </div>
    </div>
  );
}
