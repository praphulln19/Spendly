import { supabase } from '../lib/supabase';
import type { Expense, NewExpense } from '../types/expense';
import type { BudgetPeriod, NewBudgetPeriod } from '../types/budget';

/** Postgres unique_violation — the row is already there, which is what we wanted. */
const UNIQUE_VIOLATION = '23505';

export function newExpenseId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Non-secure contexts (plain http on a LAN address) have no randomUUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

async function requireUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/* -------------------------------------------------------------------------- */
/* Expenses                                                                    */
/* -------------------------------------------------------------------------- */

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  })) as Expense[];
}

/**
 * Insert an expense under a client-supplied id.
 *
 * The id is generated before the write leaves the device, so a queued write that
 * is retried after a dropped connection lands on the same primary key. A unique
 * violation therefore means "the first attempt got through" and is treated as
 * success rather than surfaced as an error.
 */
export async function createExpense(expense: NewExpense): Promise<Expense> {
  const id = expense.id ?? newExpenseId();
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, id })
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      const existing = await getExpenseById(id);
      if (existing) return existing;
    }
    throw error;
  }

  return { ...data, amount: Number(data.amount) } as Expense;
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return { ...data, amount: Number(data.amount) } as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const { count, error } = await supabase
    .from('expenses')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) throw error;
  if (count !== 1) {
    throw new Error('This expense could not be deleted. Please refresh and try again.');
  }
}

/* -------------------------------------------------------------------------- */
/* Budget periods                                                              */
/* -------------------------------------------------------------------------- */

function mapPeriod(row: Record<string, unknown>): BudgetPeriod {
  return {
    ...(row as unknown as BudgetPeriod),
    amount: Number(row.amount),
    stashed: Number(row.stashed ?? 0),
  };
}

export async function getBudgetPeriods(): Promise<BudgetPeriod[]> {
  const { data, error } = await supabase
    .from('budget_periods')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPeriod);
}

export async function createBudgetPeriod(period: NewBudgetPeriod): Promise<BudgetPeriod> {
  const user_id = await requireUserId();
  if (!user_id) throw new Error('You need to be signed in to set a budget.');

  const { data, error } = await supabase
    .from('budget_periods')
    .insert({ ...period, user_id })
    .select()
    .single();

  if (error) {
    // The no-overlap exclusion constraint fires as 23P01 (exclusion_violation).
    if (error.code === '23P01') {
      throw new Error('That date range overlaps a budget you have already set.');
    }
    throw error;
  }

  return mapPeriod(data);
}

export async function updateBudgetPeriod(
  id: string,
  patch: Partial<Pick<BudgetPeriod, 'amount' | 'start_date' | 'end_date' | 'stashed'>>
): Promise<BudgetPeriod> {
  const { data, error } = await supabase
    .from('budget_periods')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23P01') {
      throw new Error('That date range overlaps a budget you have already set.');
    }
    throw error;
  }

  return mapPeriod(data);
}

export async function deleteBudgetPeriod(id: string): Promise<void> {
  const { error } = await supabase.from('budget_periods').delete().eq('id', id);
  if (error) throw error;
}
