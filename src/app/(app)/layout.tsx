import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <TopBar user={user} />
      <main className="flex-1 with-nav">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
