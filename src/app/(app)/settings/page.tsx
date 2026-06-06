import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [catRes, recurringRes] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    supabase.from('recurring_payments').select('*, category:categories(*)').eq('user_id', user.id).order('description'),
  ])

  return (
    <SettingsClient
      initialCategories={catRes.data ?? []}
      initialRecurring={recurringRes.data ?? []}
    />
  )
}
