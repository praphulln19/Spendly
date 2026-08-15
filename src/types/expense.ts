export const expenseCategories = [
  'Food',
  'Transport',
  'Education',
  'Rent/Hostel',
  'Mobile/Internet',
  'Shopping',
  'Entertainment',
  'Personal',
  'Subscriptions',
  'Other',
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];
export type ExpenseType = 'Need' | 'Want';

/**
 * The Need/Want a category usually implies, used to preselect the toggle so the
 * common case needs no tap. Always overridable.
 */
export const categoryDefaultType: Record<ExpenseCategory, ExpenseType> = {
  Food: 'Need',
  Transport: 'Need',
  Education: 'Need',
  'Rent/Hostel': 'Need',
  'Mobile/Internet': 'Need',
  Shopping: 'Want',
  Entertainment: 'Want',
  Personal: 'Want',
  Subscriptions: 'Want',
  Other: 'Need',
};

export interface Expense {
  id: string;
  user_id: string;
  date: string;
  category: ExpenseCategory;
  /** Optional — the category name stands in when this is empty */
  description: string;
  amount: number;
  type: ExpenseType;
  created_at: string;
  /** Written locally but not yet confirmed by the server */
  pending?: boolean;
}

export type NewExpense = Pick<Expense, 'date' | 'category' | 'description' | 'amount' | 'type'> & {
  /** Client-generated so a retried write lands on the same row */
  id?: string;
};

/** What to show as an expense's title when the description was left blank. */
export function expenseTitle(expense: Pick<Expense, 'description' | 'category'>) {
  const trimmed = expense.description.trim();
  return trimmed.length > 0 ? trimmed : expense.category;
}
