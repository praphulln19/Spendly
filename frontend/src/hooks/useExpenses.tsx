import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { createExpense, deleteExpense, getExpenses } from '../services/expenseService'
import type { Expense, NewExpense } from '../types/expense'

type ExpenseStore = {
  expenses: Expense[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  add: (expense: NewExpense) => Promise<void>
  remove: (id: string) => Promise<void>
}

const ExpenseContext = createContext<ExpenseStore | null>(null)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const store = useExpenseData()
  return <ExpenseContext.Provider value={store}>{children}</ExpenseContext.Provider>
}

export function useExpenseStore() {
  const store = useContext(ExpenseContext)
  if (!store) throw new Error('useExpenseStore must be used inside ExpenseProvider.')
  return store
}

function useExpenseData(): ExpenseStore {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setExpenses(await getExpenses()); setError(null) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load expenses.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const add = async (expense: NewExpense) => {
    const saved = await createExpense(expense)
    setExpenses(current => [saved, ...current])
  }

  const remove = async (id: string) => {
    await deleteExpense(id)
    setExpenses(current => current.filter(expense => expense.id !== id))
  }

  return { expenses, loading, error, refresh, add, remove }
}
