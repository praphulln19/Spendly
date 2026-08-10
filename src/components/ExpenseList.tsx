'use client';

import { useState } from 'react';
import type { Expense, ExpenseCategory } from '../types/expense';
import { expenseCategories } from '../types/expense';
import { formatMoney } from './SummaryCards';
import {
  Search,
  Trash2,
  ReceiptText,
  Plus,
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

function formatDate(dateString: string) {
  if (!dateString) return '';
  const [year, month, day] = dateString.slice(0, 10).split('-');
  return `${day}-${month}-${year}`;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal?: () => void;
  showFilters?: boolean;
}

export function ExpenseList({
  expenses,
  onDelete,
  onOpenAddModal,
  showFilters = true,
}: ExpenseListProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesQuery =
      exp.description.toLowerCase().includes(query.toLowerCase()) ||
      exp.category.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleDelete = async (expense: Expense) => {
    if (window.confirm(`Delete "${expense.description}" (${formatMoney(expense.amount)})?`)) {
      setDeletingId(expense.id);
      try {
        await onDelete(expense.id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bento-card bento-col-12">
      <div className="bento-glow-spot" />
      
      {/* Header & Filter Controls */}
      {showFilters && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--text-subtle)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search expenses by description or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '2.75rem', height: '46px' }}
            />
          </div>

          {/* Category Chips Scroll Container */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none',
            }}
          >
            {(['All', ...expenseCategories] as const).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    border: active ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                    backgroundColor: active ? 'var(--primary-blue)' : 'var(--bg-card)',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: active ? '0 4px 12px var(--primary-blue-glow)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses Table / List */}
      {filteredExpenses.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 1rem',
            textAlign: 'center',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-blue-light)',
              border: '1px solid var(--primary-blue-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ReceiptText size={30} color="var(--primary-blue)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>No expenses found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '380px' }}>
            {query || selectedCategory !== 'All'
              ? 'Try clearing your filters or search criteria.'
              : 'Start tracking your spending by adding your first expense.'}
          </p>
          {onOpenAddModal && (
            <button className="btn-primary" onClick={onOpenAddModal} style={{ marginTop: '0.5rem' }}>
              <Plus size={18} />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredExpenses.map((exp) => {
            const Icon = categoryIcons[exp.category] || CircleEllipsis;
            const isDeleting = deletingId === exp.id;

            return (
              <div
                key={exp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.95rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  opacity: isDeleting ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-blue-light)',
                      border: '1px solid var(--primary-blue-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={21} color="var(--primary-blue)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {exp.description}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {exp.category} • {formatDate(exp.date)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className={exp.type === 'Need' ? 'badge-need' : 'badge-want'}>
                      {exp.type}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {formatMoney(exp.amount)}
                    </span>
                  </div>

                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(exp)}
                    disabled={isDeleting}
                    aria-label={`Delete ${exp.description}`}
                    title="Delete expense"
                    style={{ width: '36px', height: '36px', color: 'var(--accent-red)', borderColor: 'transparent' }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
