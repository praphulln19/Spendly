'use client';

import { useState, useEffect } from 'react';
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
  Menu,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'Student';
  const remainingBudget = monthlyBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  return (
    <header className="sticky top-0 z-40 px-4 py-3 sm:px-8 sm:py-4 bg-white/70 dark:bg-black/70 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Left (Circular Logo + Title) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md group-hover:scale-105 transition-transform duration-200">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
            Spendly
          </span>
        </Link>

        {/* Right Action Icons (Theme Toggle + Hamburger Menu) */}
        <div className="flex items-center gap-3">
          {/* Clean Theme Toggle Icon */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity"
            aria-label="Toggle theme"
          >
            <motion.div initial={false} animate={{ rotate: theme === 'dark' ? 180 : 0 }}>
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.div>
          </button>

          {/* Clean Hamburger Menu Button (≡) */}
          {session && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Animated Dropdown Menu Drawer */}
      {session && (
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-w-7xl mx-auto mt-3 apple-glass rounded-3xl p-5 shadow-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl flex flex-col gap-4"
            >
              {/* Account & Budget Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Signed in as</p>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 shrink-0 self-start sm:self-auto">
                  <span className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                    Budget: ₹{remainingBudget.toLocaleString('en-IN')} left
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/"
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    pathname === '/'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/expenses"
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    pathname === '/expenses'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>Expenses</span>
                </Link>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                {onOpenAddExpense && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAddExpense();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-md transition-all active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Expense</span>
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}
