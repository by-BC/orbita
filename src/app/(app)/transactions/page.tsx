import { createClient } from '@/lib/supabase/server'
import { getMonthDateRange, getCurrentMonth } from '@/lib/utils'
import TransactionsClient from './TransactionsClient'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { year, month } = getCurrentMonth()
  const { start, end } = getMonthDateRange(year, month)

  const [txRes, catRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
  ])

  return (
    <TransactionsClient
      initialTransactions={txRes.data ?? []}
      categories={catRes.data ?? []}
      year={year}
      month={month}
    />
  )
}
