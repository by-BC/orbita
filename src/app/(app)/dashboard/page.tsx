import { createClient } from '@/lib/supabase/server'
import { getMonthDateRange, getCurrentMonth } from '@/lib/utils'
import type { Transaction, Category } from '@/types/database'
import DashboardClient from './DashboardClient'

type TxWithCategory = Transaction & { category?: Category | null }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { year, month } = getCurrentMonth()
  const { start, end } = getMonthDateRange(year, month)

  const [transactionsRes, recurringRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false }),
    supabase
      .from('recurring_payments')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('is_active', true),
  ])

  const transactions = (transactionsRes.data ?? []) as TxWithCategory[]
  const recurring = recurringRes.data ?? []

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status !== 'overdue')
    .reduce((s, t) => s + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const pendingTotal = transactions
    .filter(t => t.status === 'pending' || t.status === 'overdue')
    .reduce((s, t) => s + t.amount, 0)

  const pendingTransactions = transactions
    .filter(t => t.status === 'pending' || t.status === 'overdue')
    .sort((a, b) => a.date.localeCompare(b.date))
  const nextDue = pendingTransactions[0] ?? null

  const categoryTotals: Record<string, { name: string; color: string; amount: number }> = {}
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const key = t.category_id ?? 'other'
      const cat = t.category
      if (!categoryTotals[key]) {
        categoryTotals[key] = {
          name: cat?.name ?? 'Outros',
          color: cat?.color ?? '#9ca3af',
          amount: 0,
        }
      }
      categoryTotals[key].amount += t.amount
    })

  const categoryData = Object.values(categoryTotals)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)

  return (
    <DashboardClient
      year={year}
      month={month}
      totalIncome={totalIncome}
      totalExpenses={totalExpenses}
      pendingTotal={pendingTotal}
      nextDue={nextDue}
      categoryData={categoryData}
      recentTransactions={transactions.slice(0, 5)}
      recurringCount={recurring.length}
    />
  )
}
