import { supabase } from '../lib/supabase'
import type { Expense, NewExpense } from '../types/expense'

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
  if (error) throw error
  return data.map(expense => ({ ...expense, amount: Number(expense.amount) })) as Expense[]
}

export async function createExpense(expense: NewExpense): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').insert(expense).select().single()
  if (error) throw error
  return { ...data, amount: Number(data.amount) } as Expense
}

export async function deleteExpense(id: string): Promise<void> {
  // Count the affected row instead of requesting its representation. This
  // keeps deletion dependent only on the DELETE policy, not SELECT access.
  const { count, error } = await supabase.from('expenses').delete({ count: 'exact' }).eq('id', id)
  if (error) throw error
  if (count !== 1) throw new Error('This expense could not be deleted. Please refresh and try again.')
}
