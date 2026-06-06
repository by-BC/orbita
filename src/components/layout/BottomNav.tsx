'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Extrato' },
  { href: '/reports', icon: BarChart3, label: 'Relatórios' },
  { href: '/settings', icon: Settings, label: 'Config.' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        height: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0))',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
