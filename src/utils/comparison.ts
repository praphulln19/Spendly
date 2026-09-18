import type { Expense } from '../types/expense';
import { getExpensesForMonth, getMonthKey, getPreviousMonthKey } from './budgetUtils';

export interface CategoryDelta {
  category: string;
  current: number;
  previous: number;
  /** null when there's no previous-month spend in this category to compare against */
  percentChange: number | null;
}

export interface MonthComparison {
  currentTotal: number;
  previousTotal: number;
  percentChange: number | null;
  /** Sorted by the size of the swing, largest first */
  categories: CategoryDelta[];
  /** True when `monthKey` is still in progress, so `previousTotal` was clipped to
   *  the same day-of-month range rather than compared against a full month. */
  isPartial: boolean;
}

function sumByCategory(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const exp of expenses) {
    totals[exp.category] = (totals[exp.category] ?? 0) + exp.amount;
  }
  return totals;
}

function dayOfMonth(dateIso: string): number {
  return Number(dateIso.slice(8, 10));
}

function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Compares a calendar month against the one before it, not budget periods --
 * periods can have gaps and different lengths, so a raw total-vs-total
 * comparison across them would need per-day normalization to mean anything.
 * Calendar months are already the uniform unit this page browses.
 *
 * When `monthKey` is the ongoing month, the previous month's data is clipped
 * to the same day-of-month range first: 14 days of this month against all 30
 * of last month would always look artificially ahead otherwise.
 */
export function compareToPreviousMonth(
  expenses: Expense[],
  monthKey: string,
  now: Date = new Date()
): MonthComparison {
  const currentMonthExpenses = getExpensesForMonth(expenses, monthKey);
  const previousMonthKey = getPreviousMonthKey(monthKey);
  let previousMonthExpenses = getExpensesForMonth(expenses, previousMonthKey);

  const isPartial = monthKey === getMonthKey(now);
  if (isPartial) {
    const cutoff = dayOfMonth(getMonthKey(now) + '-01'.slice(0, 0) + now.getDate().toString().padStart(2, '0'));
    previousMonthExpenses = previousMonthExpenses.filter((exp) => dayOfMonth(exp.date) <= cutoff);
  }

  const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const previousTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const currentByCategory = sumByCategory(currentMonthExpenses);
  const previousByCategory = sumByCategory(previousMonthExpenses);
  const categoryNames = new Set([...Object.keys(currentByCategory), ...Object.keys(previousByCategory)]);

  const categories: CategoryDelta[] = Array.from(categoryNames)
    .map((category) => {
      const current = currentByCategory[category] ?? 0;
      const previous = previousByCategory[category] ?? 0;
      return { category, current, previous, percentChange: percentChange(current, previous) };
    })
    .sort((a, b) => Math.abs(b.current - b.previous) - Math.abs(a.current - a.previous));

  return {
    currentTotal,
    previousTotal,
    percentChange: percentChange(currentTotal, previousTotal),
    categories,
    isPartial,
  };
}
