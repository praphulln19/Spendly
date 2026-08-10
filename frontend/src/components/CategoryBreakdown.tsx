'use client';

import type { Expense, ExpenseCategory } from '../types/expense';
import { formatMoney } from './SummaryCards';
import {
  Utensils,
  Bus,
  GraduationCap,
  Home,
  Smartphone,
  ShoppingBag,
  Film,
  User,
  Repeat,
  CircleEllipsis,
  type LucideIcon,
  Layers,
} from 'lucide-react';

const categoryIcons: Record<ExpenseCategory, LucideIcon> = {
  Food: Utensils,
  Transport: Bus,
  Education: GraduationCap,
  'Rent/Hostel': Home,
  'Mobile/Internet': Smartphone,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Personal: User,
  Subscriptions: Repeat,
  Other: CircleEllipsis,
};

interface CategoryBreakdownProps {
  expenses: Expense[];
}

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const categoryTotals = Object.entries(
    expenses.reduce<Record<string, number>>((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  )
    .map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const maxAmount = categoryTotals.length > 0 ? categoryTotals[0].amount : 1;

  return (
    <div className="bento-card bento-col-7">
      <div className="bento-glow-spot" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={17} color="var(--primary-blue)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Category Breakdown
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top spending distributions</p>
          </div>
        </div>
        <span className="bento-pill">{categoryTotals.length} Categories</span>
      </div>

      {categoryTotals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.875rem' }}>No spending recorded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {categoryTotals.slice(0, 5).map(({ category, amount }) => {
            const Icon = categoryIcons[category] || CircleEllipsis;
            const percentage = Math.max(6, Math.round((amount / maxAmount) * 100));

            return (
              <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-muted)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} color="var(--primary-blue)" />
                    </div>
                    <span style={{ fontSize: '0.90625rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.90625rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                    {formatMoney(amount)}
                  </span>
                </div>

                {/* Glowing Progress bar */}
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 0 12px var(--primary-blue-glow)',
                      transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
