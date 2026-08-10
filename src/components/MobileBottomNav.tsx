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
    <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="apple-glass rounded-3xl p-2 flex items-center justify-around shadow-2xl border border-black/10 dark:border-white/15">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1.5 px-5 rounded-2xl transition-all ${
            pathname === '/'
              ? 'text-black dark:text-white bg-black/5 dark:bg-white/10 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>

        {onOpenAddExpense && (
          <button
            onClick={onOpenAddExpense}
            className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform -mt-4 border-4 border-[#f5f5f7] dark:border-black"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        <Link
          href="/expenses"
          className={`flex flex-col items-center gap-1 py-1.5 px-5 rounded-2xl transition-all ${
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
