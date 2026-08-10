'use client';

import { Wallet, CheckCircle2, Heart, TrendingUp } from 'lucide-react';
import type { Expense } from '../types/expense';

interface SummaryCardsProps {
  expenses: Expense[];
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const totals = expenses.reduce(
    (acc, exp) => ({
      total: acc.total + exp.amount,
      needs: acc.needs + (exp.type === 'Need' ? exp.amount : 0),
      wants: acc.wants + (exp.type === 'Want' ? exp.amount : 0),
    }),
    { total: 0, needs: 0, wants: 0 }
  );

  return (
    <>
      {/* Total Spending Bento Card */}
      <div className="bento-card bento-col-4">
        <div className="bento-glow-spot" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Spending
          </span>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-blue-light)',
              border: '1px solid var(--primary-blue-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={21} color="var(--primary-blue)" />
          </div>
        </div>
        <div style={{ fontSize: '2.125rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {formatMoney(totals.total)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <span className="bento-pill">
            <TrendingUp size={13} />
            <span>{expenses.length} transaction{expenses.length === 1 ? '' : 's'}</span>
          </span>
        </div>
      </div>

      {/* Needs Total Bento Card */}
      <div className="bento-card bento-col-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Needs Total
          </span>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-green-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={21} color="var(--accent-green)" />
          </div>
        </div>
        <div style={{ fontSize: '2.125rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {formatMoney(totals.needs)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <span className="badge-need">
            {totals.total > 0 ? Math.round((totals.needs / totals.total) * 100) : 0}% of budget
          </span>
        </div>
      </div>

      {/* Wants Total Bento Card */}
      <div className="bento-card bento-col-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Wants Total
          </span>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-orange-bg)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={21} color="var(--accent-orange)" />
          </div>
        </div>
        <div style={{ fontSize: '2.125rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {formatMoney(totals.wants)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <span className="badge-want">
            {totals.total > 0 ? Math.round((totals.wants / totals.total) * 100) : 0}% of budget
          </span>
        </div>
      </div>
    </>
  );
}
