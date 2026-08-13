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
  User as UserIcon,
  Menu,
  X,
} from 'lucide-react';

interface AppleNavbarProps {
  session: Session | null;
  onOpenAddExpense?: () => void;
  monthlyBudget?: number;
  totalSpent?: number;
  remainingBudget?: number;
}

export function AppleNavbar({
  session,
  onOpenAddExpense,
  monthlyBudget = 0,
  totalSpent = 0,
  remainingBudget: customRemaining,
}: AppleNavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'Student';
  const remainingBudget = customRemaining ?? (monthlyBudget - totalSpent);
  const isOverBudget = remainingBudget < 0;

  return (
    <header className="sticky top-0 z-40 px-3 py-2 sm:px-8 sm:py-3">
      {/* ---------------------------------------------------- */}
      {/* 1. DESKTOP NAVBAR (Visible on LG screens >= 1024px)  */}
      {/* ---------------------------------------------------- */}
      <div className="hidden lg:flex max-w-7xl mx-auto apple-glass rounded-3xl px-5 py-3 items-center justify-between transition-all duration-300 relative">
        {/* Brand & Segmented Navigation Tabs */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-display">
              Spendly
            </span>
          </Link>

          {session && (
            <nav className="apple-segmented-container flex">
              <Link href="/" className="relative">
                <span
                  className={`apple-segmented-button flex items-center gap-2 ${
                    pathname === '/'
                      ? 'apple-segmented-active'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </span>
                {pathname === '/' && (
                  <motion.div
                    layoutId="navbar-tab-desktop"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>

              <Link href="/expenses" className="relative">
                <span
                  className={`apple-segmented-button flex items-center gap-2 ${
                    pathname === '/expenses'
                      ? 'apple-segmented-active'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>Expenses</span>
                </span>
                {pathname === '/expenses' && (
                  <motion.div
                    layoutId="navbar-tab-desktop"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </nav>
          )}
        </div>

        {/* Desktop Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {session && (
            <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
              {monthlyBudget > 0 ? (
                <span>
                  Budget:{' '}
                  <strong className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                    ₹{remainingBudget.toLocaleString('en-IN')} left
                  </strong>
                </span>
              ) : (
                <span className="text-neutral-400 font-medium">Budget Not Set</span>
              )}
            </div>
          )}

          {session && onOpenAddExpense && (
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all"
            aria-label="Toggle theme"
          >
            <motion.div initial={false} animate={{ rotate: theme === 'dark' ? 180 : 0 }}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>

          {session && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:scale-105 transition-all"
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

      {/* ---------------------------------------------------- */}
      {/* 2. MOBILE NAVBAR (Visible on screens < 1024px)        */}
      {/* ---------------------------------------------------- */}
      <div className="lg:hidden max-w-7xl mx-auto flex items-center justify-between px-2 py-1">
        {/* Brand Left (Circular Logo + Title) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-display tracking-tight text-neutral-900 dark:text-white">
            Spendly
          </span>
        </Link>

        {/* Right Icon Controls (Theme + Hamburger) */}
        <div className="flex items-center gap-2">
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

          {session && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Hamburger Dropdown Drawer */}
      {session && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:hidden max-w-7xl mx-auto mt-2 apple-glass rounded-3xl p-4 shadow-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl flex flex-col gap-3"
            >
              {/* Account Info & Budget */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Account</p>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/10 shrink-0">
                  {monthlyBudget > 0 ? (
                    <span className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                      Budget: ₹{remainingBudget.toLocaleString('en-IN')} left
                    </span>
                  ) : (
                    <span className="text-neutral-400 font-medium">Budget Not Set</span>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all ${
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
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all ${
                    pathname === '/expenses'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>Expenses</span>
                </Link>
              </div>

              {/* Mobile Actions */}
              <div className="flex flex-col gap-2 pt-1 border-t border-black/5 dark:border-white/10">
                {onOpenAddExpense && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAddExpense();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-md transition-all active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Expense</span>
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
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
