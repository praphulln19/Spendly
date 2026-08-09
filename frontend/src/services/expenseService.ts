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
  // Request the deleted row back.  Without this, PostgREST can report a
  // successful request even when row-level security filtered the row out.
  const { data, error } = await supabase.from('expenses').delete().eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This expense could not be deleted. Please refresh and try again.')
}
