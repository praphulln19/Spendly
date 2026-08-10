'use client';

import type { Expense } from '../types/expense';
import { formatMoney } from './SummaryCards';
import { PieChart } from 'lucide-react';

interface NeedVsWantChartProps {
  expenses: Expense[];
}

export function NeedVsWantChart({ expenses }: NeedVsWantChartProps) {
  const totals = expenses.reduce(
    (acc, exp) => ({
      needs: acc.needs + (exp.type === 'Need' ? exp.amount : 0),
      wants: acc.wants + (exp.type === 'Want' ? exp.amount : 0),
      total: acc.total + exp.amount,
    }),
    { needs: 0, wants: 0, total: 0 }
  );

  const needsPercentage = totals.total > 0 ? Math.round((totals.needs / totals.total) * 100) : 50;
  const wantsPercentage = totals.total > 0 ? 100 - needsPercentage : 50;

  return (
    <div className="bento-card bento-col-5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-purple-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PieChart size={17} color="var(--accent-purple)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Need vs. Want
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Essential vs luxury ratio</p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          margin: 'auto 0',
        }}
      >
        {/* Ring Chart */}
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Wants Background Arc */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--accent-orange)"
              strokeWidth="3.8"
              strokeDasharray="100, 100"
            />
            {/* Needs Arc */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--accent-green)"
              strokeWidth="3.8"
              strokeDasharray={`${needsPercentage}, 100`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>

          {/* Center stats */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
              {formatMoney(totals.total)}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', width: '100%', justifyContent: 'center' }}>
          {/* Needs */}
          <div
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-green-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green-text)' }}>
              Needs ({needsPercentage}%)
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {formatMoney(totals.needs)}
            </p>
          </div>

          {/* Wants */}
          <div
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-orange-bg)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-orange-text)' }}>
              Wants ({wantsPercentage}%)
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {formatMoney(totals.wants)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
