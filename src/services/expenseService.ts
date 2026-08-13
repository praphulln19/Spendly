import { supabase } from '../lib/supabase';
import type { Expense, NewExpense } from '../types/expense';

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(expense => ({
    ...expense,
    amount: Number(expense.amount),
  })) as Expense[];
}

export async function createExpense(expense: NewExpense): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
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

export async function getUserBudget(): Promise<number | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from('user_budgets')
    .select('monthly_budget')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.warn('Unable to fetch budget from database:', error.message);
    return null;
  }

  return data ? Number(data.monthly_budget) : null;
}

export async function saveUserBudget(amount: number): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const { error } = await supabase
    .from('user_budgets')
    .upsert(
      {
        user_id: session.user.id,
        monthly_budget: amount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.warn('Unable to save budget to database:', error.message);
  }
}
