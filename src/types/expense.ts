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

export interface Expense {
  id: string;
  user_id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  type: ExpenseType;
  created_at: string;
}

export type NewExpense = Pick<Expense, 'date' | 'category' | 'description' | 'amount' | 'type'>;
