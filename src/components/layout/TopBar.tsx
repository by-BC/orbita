'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Bell, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TopBar({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const name = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Usuário'
  const initial = name[0].toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-40 px-4 flex items-center justify-between h-14"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--primary)' }}
        >
          <span className="text-white text-xs font-bold">O</span>
        </div>
        <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Orbita</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {initial}
            </div>
          </button>

          {open && (
            <>
              <div className="fixed inset-0" onClick={() => setOpen(false)} />
              <div
                className="absolute right-0 top-10 w-48 rounded-xl shadow-lg z-50 py-1"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-70"
                  style={{ color: 'var(--destructive)' }}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
