export interface BudgetPeriod {
  id: string;
  user_id: string;
  amount: number;
  /** Inclusive YYYY-MM-DD start of the window */
  start_date: string;
  /** Inclusive YYYY-MM-DD end of the window */
  end_date: string;
  /** Piggy bank: money pulled out of the pool so it stops being redistributed */
  stashed: number;
  created_at: string;
}

export type NewBudgetPeriod = Pick<BudgetPeriod, 'amount' | 'start_date' | 'end_date'>;
