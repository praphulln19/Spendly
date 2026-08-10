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
    <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
      <div className="apple-glass rounded-3xl p-1.5 flex items-center justify-between shadow-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-3xl">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all ${
            pathname === '/'
              ? 'text-black dark:text-white bg-black/5 dark:bg-white/10 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>

        {onOpenAddExpense && (
          <div className="px-2">
            <button
              onClick={onOpenAddExpense}
              className="w-11 h-11 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              aria-label="Add Expense"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        <Link
          href="/expenses"
          className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all ${
            pathname === '/expenses'
              ? 'text-black dark:text-white bg-black/5 dark:bg-white/10 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px]">Expenses</span>
        </Link>
      </div>
    </div>
  );
}
