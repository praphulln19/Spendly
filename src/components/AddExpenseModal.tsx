'use client';

import { useState } from 'react';
import { X, Calendar, Tag, FileText, IndianRupee, CheckCircle2 } from 'lucide-react';
import { expenseCategories, type ExpenseCategory, type ExpenseType } from '../types/expense';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: {
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    type: ExpenseType;
  }) => Promise<void>;
}

export function AddExpenseModal({ isOpen, onClose, onAdd }: AddExpenseModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<ExpenseType>('Need');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Please choose a valid date.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description for this expense.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }

    setSaving(true);
    try {
      await onAdd({
        date,
        category,
        description: description.trim(),
        amount: numericAmount,
        type,
      });
      // Reset form
      setDescription('');
      setAmount('');
      setError(null);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="bento-card animate-modal-in"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bento-glow-spot" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>Add Expense</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Log your spending into the database</p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={19} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-red-bg)',
              border: '1px solid var(--accent-red)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-red-text)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Date */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
              <Calendar size={15} color="var(--primary-blue)" />
              <span>Date</span>
            </label>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Category Selector Grid */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.55rem' }}>
              <Tag size={15} color="var(--primary-blue)" />
              <span>Category</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {expenseCategories.map((cat) => {
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      border: selected ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                      backgroundColor: selected ? 'var(--primary-blue)' : 'var(--bg-card)',
                      color: selected ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
              <FileText size={15} color="var(--primary-blue)" />
              <span>Description</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
              <IndianRupee size={15} color="var(--primary-blue)" />
              <span>Amount (INR)</span>
            </label>
            <input
              type="number"
              step="any"
              className="input-field"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Expense Type (Need vs Want) */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.55rem' }}>
              <CheckCircle2 size={15} color="var(--primary-blue)" />
              <span>Expense Type</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setType('Need')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  border: type === 'Need' ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                  backgroundColor: type === 'Need' ? 'var(--accent-green-bg)' : 'var(--bg-card)',
                  color: type === 'Need' ? 'var(--accent-green-text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Need
              </button>

              <button
                type="button"
                onClick={() => setType('Want')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  border: type === 'Want' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                  backgroundColor: type === 'Want' ? 'var(--accent-orange-bg)' : 'var(--bg-card)',
                  color: type === 'Want' ? 'var(--accent-orange-text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Want
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
