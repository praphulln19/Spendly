'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeProvider';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Allowance } from '../utils/allowance';
import { formatMoney } from '../utils/format';
import { SpendlyMark } from './SpendlyMark';
import {
  Wallet,
  Sun,
  LineChart,
  ReceiptText,
  Plus,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Today', icon: Wallet },
  { href: '/insights', label: 'Insights', icon: LineChart },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
] as const;

interface AppleNavbarProps {
  session: Session | null;
  allowance: Allowance | null;
  onOpenAddExpense?: () => void;
}

/** The one figure worth carrying on every screen. */
function AllowancePill({ allowance, compact = false }: { allowance: Allowance | null; compact?: boolean }) {
  if (!allowance || allowance.phase !== 'active') {
    return <span className="text-neutral-400 font-medium">No budget set</span>;
  }

  const over = allowance.todayLeft < 0;
  return (
    <span className={compact ? '' : 'text-neutral-700 dark:text-neutral-300'}>
      <strong className={`tabular-nums ${over ? 'text-red-500' : 'text-emerald-500'}`}>
        {formatMoney(Math.abs(allowance.todayLeft))}
      </strong>{' '}
      {over ? 'over today' : 'left today'}
    </span>
  );
}

export function AppleNavbar({ session, allowance, onOpenAddExpense }: AppleNavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'Account';

  return (
    <header className="sticky top-0 z-40 px-3 py-2 sm:px-8 sm:py-3">
      {/* Desktop */}
      <div className="hidden lg:flex max-w-5xl mx-auto apple-glass rounded-3xl px-5 py-3 items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md group-hover:scale-105 transition-transform duration-200">
              <SpendlyMark className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-display">
              Spendly
            </span>
          </Link>

          {session && (
            <nav className="apple-segmented-container flex">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="relative">
                    <span
                      className={`apple-segmented-button flex items-center gap-2 ${
                        active
                          ? 'apple-segmented-active'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {active && (
                      <motion.div
                        layoutId="navbar-tab-desktop"
                        className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {session && (
            <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/10">
              <AllowancePill allowance={allowance} />
            </div>
          )}

          {session && onOpenAddExpense && (
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add expense</span>
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
                aria-label="Account menu"
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
                      <span>Sign out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden max-w-5xl mx-auto flex items-center justify-between px-2 py-1">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md">
            <SpendlyMark className="w-5 h-5" />
          </div>
          <span className="text-lg font-black font-display tracking-tight text-neutral-900 dark:text-white">
            Spendly
          </span>
        </Link>

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
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {session && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:hidden max-w-5xl mx-auto mt-2 apple-glass rounded-3xl p-4 shadow-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
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
                <div className="text-xs font-bold px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/10 shrink-0">
                  <AllowancePill allowance={allowance} compact />
                </div>
              </div>

              {/* Navigation and Add live in the bottom dock on mobile, so the
                  drawer carries only what the dock cannot: who is signed in,
                  and the way out. */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}
