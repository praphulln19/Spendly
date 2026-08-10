'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { AppleNavbar } from '../components/AppleNavbar';
import { AppleAuthScreen } from '../components/AppleAuthScreen';
import { BudgetRing } from '../components/BudgetRing';
import { AnalyticsBarChart } from '../components/AnalyticsBarChart';
import { GlassCategoryBreakdown } from '../components/GlassCategoryBreakdown';
import { GlassExpenseList } from '../components/GlassExpenseList';
import { GlassAddExpenseModal } from '../components/GlassAddExpenseModal';
import { SetBudgetModal } from '../components/SetBudgetModal';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useExpenseStore } from '../hooks/useExpenses';
import { Plus, ArrowRight, Loader2, RefreshCw, Sparkles, ReceiptText } from 'lucide-react';

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const {
    expenses,
    loading,
    error,
    monthlyBudget,
    setMonthlyBudget,
    refresh,
    add,
    remove,
    loadSampleData,
    exportCSV,
  } = useExpenseStore();

  useEffect(() => {
    const handleInitialSession = async () => {
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { data } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (data.session) {
              setSession(data.session);
              setReady(true);
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          }
        } catch {
          // Fall back to getSession()
        }
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setReady(true);
    };

    void handleInitialSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
      if (nextSession && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f5f5f7] dark:bg-black text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-bold font-display tracking-tight">Opening Spendly...</p>
      </div>
    );
  }

  if (!session) {
    return <AppleAuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black pb-24 sm:pb-16">
      <AppleNavbar
        session={session}
        onOpenAddExpense={() => setIsAddModalOpen(true)}
        monthlyBudget={monthlyBudget}
        totalSpent={totalSpent}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
        {/* Header Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-black/5 dark:border-white/10 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>DASHBOARD OVERVIEW</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
              Student Financial Hub
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </motion.div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold mb-6">
            <span>{error}</span>
            <button
              onClick={() => refresh()}
              className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-semibold">Loading student analytics...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Top Grid: Budget Ring + Spending Trends + Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {/* Budget Goal Ring */}
              <BudgetRing
                expenses={expenses}
                monthlyBudget={monthlyBudget}
                onOpenSetBudget={() => setIsBudgetModalOpen(true)}
              />

              {/* Spending Trends Bar Chart */}
              <AnalyticsBarChart expenses={expenses} />

              {/* Category Breakdown */}
              <GlassCategoryBreakdown expenses={expenses} />
            </div>

            {/* Recent Activity Section */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg sm:text-xl font-bold font-display text-neutral-900 dark:text-white">
                    Recent Activity
                  </h2>
                </div>

                <Link
                  href="/expenses"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <GlassExpenseList
                expenses={expenses.slice(0, 5)}
                onDelete={remove}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onExportCSV={exportCSV}
                onLoadSampleData={loadSampleData}
                showFilters={false}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Mobile Bottom Navigation */}
      <MobileBottomNav onOpenAddExpense={() => setIsAddModalOpen(true)} />

      {/* Modals */}
      <GlassAddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (exp) => {
          await add(exp);
        }}
      />

      <SetBudgetModal
        isOpen={isBudgetModalOpen}
        currentBudget={monthlyBudget}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={(newBudget) => setMonthlyBudget(newBudget)}
      />
    </div>
  );
}
