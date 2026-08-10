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
  Sparkles,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
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
  const remainingBudget = monthlyBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  return (
    <header className="sticky top-0 z-40 px-3 py-2 sm:px-8 sm:py-3">
      <div className="max-w-7xl mx-auto apple-glass rounded-2xl sm:rounded-3xl px-3.5 py-2 sm:px-5 sm:py-3 flex items-center justify-between transition-all duration-300 relative">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-display">
              Spendly
            </span>
          </Link>

          {/* Desktop Navigation Tabs (LG screens >= 1024px) */}
          {session && (
            <nav className="apple-segmented-container hidden lg:flex">
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
                    layoutId="navbar-tab"
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
                    layoutId="navbar-tab"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </nav>
          )}
        </div>

        {/* Right Desktop Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Budget Badge */}
          {session && (
            <div className="hidden xl:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-2xl bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>
                Budget:{' '}
                <strong className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                  ₹{remainingBudget.toLocaleString('en-IN')} left
                </strong>
              </span>
            </div>
          )}

          {/* Desktop Add Expense Button */}
          {session && onOpenAddExpense && (
            <button
              onClick={onOpenAddExpense}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl sm:rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all"
            aria-label="Toggle theme"
          >
            <motion.div initial={false} animate={{ rotate: theme === 'dark' ? 180 : 0 }}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>

          {/* Desktop Profile Dropdown (SM & up) */}
          {session && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:scale-105 transition-all"
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
                    className="absolute right-0 top-full mt-2 w-56 sm:w-60 rounded-2xl p-2.5 shadow-2xl z-[100] bg-white/95 dark:bg-neutral-900/95 border border-black/10 dark:border-white/15 backdrop-blur-3xl"
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

          {/* Mobile Hamburger Menu Button (LG screen < 1024px) */}
          {session && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Animated Mobile Hamburger Menu Drawer */}
      {session && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:hidden max-w-7xl mx-auto mt-2 apple-glass rounded-2xl p-4 shadow-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl flex flex-col gap-3"
            >
              {/* User Account Info */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
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
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                    ₹{remainingBudget.toLocaleString('en-IN')} left
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/expenses"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/expenses'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
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
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Expense</span>
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
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
