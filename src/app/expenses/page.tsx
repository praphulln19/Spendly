'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { AppleNavbar } from '../../components/AppleNavbar';
import { AppleAuthScreen } from '../../components/AppleAuthScreen';
import { GlassExpenseList } from '../../components/GlassExpenseList';
import { GlassAddExpenseModal } from '../../components/GlassAddExpenseModal';
import { useExpenseStore } from '../../hooks/useExpenses';
import { Plus, Loader2, RefreshCw, ReceiptText } from 'lucide-react';

export default function ExpensesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    expenses,
    loading,
    error,
    monthlyBudget,
    refresh,
    add,
    remove,
    loadSampleData,
    exportCSV,
  } = useExpenseStore();

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
      if (nextSession && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      }
      setReady(true);
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
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black pb-16">
      <AppleNavbar
        session={session}
        onOpenAddExpense={() => setIsAddModalOpen(true)}
        monthlyBudget={monthlyBudget}
        totalSpent={totalSpent}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Header Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-black/5 dark:border-white/10 mb-2">
              <ReceiptText className="w-3.5 h-3.5 text-blue-500" />
              <span>ALL TRANSACTIONS</span>
            </div>
            <h1 className="text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
              Transaction Records
            </h1>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
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
            <p className="text-xs font-semibold">Loading transactions...</p>
          </div>
        ) : (
          <GlassExpenseList
            expenses={expenses}
            onDelete={remove}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onExportCSV={exportCSV}
            onLoadSampleData={loadSampleData}
            showFilters={true}
          />
        )}
      </main>

      {/* Add Expense Modal */}
      <GlassAddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (exp) => {
          await add(exp);
        }}
      />
    </div>
  );
}
