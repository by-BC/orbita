import { createClient } from '@/lib/supabase/server'
import type { Transaction, RecurringPayment, Category } from '@/types/database'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Last 6 months of data
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  const startDate = sixMonthsAgo.toISOString().split('T')[0]

  const [txRes, recurringRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .order('date'),
    supabase
      .from('recurring_payments')
      .select('*, category:categories(*)')
      .eq('user_id', user.id),
  ])

  return (
    <ReportsClient
      transactions={(txRes.data ?? []) as (Transaction & { category?: Category | null })[]}
      recurringPayments={(recurringRes.data ?? []) as (RecurringPayment & { category?: Category | null })[]}
    />
  )
}
