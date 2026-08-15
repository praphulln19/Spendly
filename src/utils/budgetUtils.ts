import type { Expense } from '../types/expense';

/**
 * Format Date object or ISO string to YYYY-MM key (e.g. "2026-08")
 */
export function getMonthKey(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns human-readable label for a YYYY-MM key (e.g. "August 2026")
 */
export function formatMonthLabel(monthKey: string): string {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey;
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get previous YYYY-MM key relative to a given YYYY-MM key
 */
export function getPreviousMonthKey(monthKey: string): string {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return getMonthKey(new Date());
  }
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${prevYear}-${prevMonth}`;
}

/**
 * Get next YYYY-MM key relative to a given YYYY-MM key
 */
export function getNextMonthKey(monthKey: string): string {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return getMonthKey(new Date());
  }
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

/**
 * Filter expenses that belong to a specific YYYY-MM month key
 */
export function getExpensesForMonth(expenses: Expense[], monthKey: string): Expense[] {
  return expenses.filter(exp => exp.date && exp.date.startsWith(monthKey));
}

/**
 * Total amount spent for expenses in a specific YYYY-MM month key
 */
export function getMonthTotalSpent(expenses: Expense[], monthKey: string): number {
  return getExpensesForMonth(expenses, monthKey).reduce((sum, exp) => sum + exp.amount, 0);
}

/*
 * Rollover and daily-allowance logic lives in `utils/allowance.ts` and works off
 * budget periods rather than calendar months. What remains here is the month
 * bucketing the Insights screen uses for historical review.
 */
