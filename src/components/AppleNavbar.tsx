'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeProvider';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  Plus,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

interface AppleNavbarProps {
  session: Session | null;
  onOpenAddExpense?: () => void;
  monthlyBudget?: number;
  totalSpent?: number;
}

export function AppleNavbar({
  session,
  onOpenAddExpense,
  monthlyBudget = 20000,
  totalSpent = 0,
}: AppleNavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'Student';
  const remainingBudget = monthlyBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  return (
    <header className="sticky top-0 z-40 px-3 py-2 sm:px-8 sm:py-3">
      <div className="max-w-7xl mx-auto apple-glass rounded-2xl sm:rounded-3xl px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between transition-all duration-300">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-4 sm:gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-display">
              Spendly
            </span>
          </Link>

          {/* Apple Segmented Control Tabs */}
          {session && (
            <nav className="apple-segmented-container hidden sm:flex">
              <Link href="/" className="relative">
                <span
                  className={`apple-segmented-button flex items-center gap-2 ${
                    pathname === '/' ? 'apple-segmented-active' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </span>
                {pathname === '/' && (
                  <motion.div
                    layoutId="navbar-tab"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>

              <Link href="/expenses" className="relative">
                <span
                  className={`apple-segmented-button flex items-center gap-2 ${
                    pathname === '/expenses' ? 'apple-segmented-active' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>Expenses</span>
                </span>
                {pathname === '/expenses' && (
                  <motion.div
                    layoutId="navbar-tab"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-2xl bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>
                Budget:{' '}
                <strong className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                  ₹{remainingBudget.toLocaleString('en-IN')} left
                </strong>
              </span>
            </div>
          )}

          {session && onOpenAddExpense && (
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl sm:rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Add Expense</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all"
            aria-label="Toggle theme"
          >
            <motion.div initial={false} animate={{ rotate: theme === 'dark' ? 180 : 0 }}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>

          {/* Profile Dropdown */}
          {session && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:scale-105 transition-all"
                aria-label="Profile menu"
              >
                <UserIcon className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-60 rounded-2xl p-2.5 shadow-2xl z-[100] bg-white/95 dark:bg-neutral-900/95 border border-black/10 dark:border-white/15 backdrop-blur-3xl"
                  >
                    <div className="px-3 py-2 border-b border-black/5 dark:border-white/10 mb-1">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">Signed in as</p>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                        {userEmail}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
