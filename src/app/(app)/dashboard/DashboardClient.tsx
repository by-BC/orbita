'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Clock, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react'
import { formatCurrency, formatMonthYear, formatDateShort } from '@/lib/utils'
import type { Transaction } from '@/types/database'
import CategoryIcon from '@/components/ui/CategoryIcon'
import StatusBadge from '@/components/ui/StatusBadge'
import QuickAddFAB from '@/components/transactions/QuickAddFAB'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'

interface Props {
  year: number
  month: number
  totalIncome: number
  totalExpenses: number
  pendingTotal: number
  nextDue: Transaction | null
  categoryData: { name: string; color: string; amount: number }[]
  recentTransactions: (Transaction & { category?: { name: string; icon: string; color: string } | null })[]
  recurringCount: number
}

export default function DashboardClient({
  year, month, totalIncome, totalExpenses, pendingTotal,
  nextDue, categoryData, recentTransactions, recurringCount,
}: Props) {
  const router = useRouter()
  const balance = totalIncome - totalExpenses

  function refresh() {
    router.refresh()
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
            {formatMonthYear(year, month)}
          </p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>
            Visão Geral
          </h1>
        </div>
      </div>

      {/* Balance card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--primary)', color: '#fff' }}
      >
        <p className="text-sm opacity-80 mb-1">Saldo previsto</p>
        <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
        <div className="flex gap-4 mt-4">
          <div>
            <p className="text-xs opacity-70">Receitas</p>
            <p className="text-base font-semibold">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <p className="text-xs opacity-70">Despesas</p>
            <p className="text-base font-semibold">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} style={{ color: 'var(--warning)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Pendente</p>
          </div>
          <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            {formatCurrency(pendingTotal)}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={16} style={{ color: 'var(--primary)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Recorrentes</p>
          </div>
          <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{recurringCount} ativas</p>
        </div>
      </div>

      {/* Next due */}
      {nextDue && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: '#fef3c7', border: '1px solid #fde68a' }}
        >
          <AlertCircle size={18} color="#d97706" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: '#92400e' }}>Próxima conta</p>
            <p className="text-sm font-semibold truncate" style={{ color: '#78350f' }}>
              {nextDue.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold" style={{ color: '#78350f' }}>
              {formatCurrency(nextDue.amount)}
            </p>
            <p className="text-xs" style={{ color: '#92400e' }}>
              {formatDateShort(nextDue.date)}
            </p>
          </div>
        </div>
      )}

      {/* Category chart */}
      {categoryData.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Gastos por categoria
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="amount" cx="50%" cy="50%"
                    innerRadius="55%" outerRadius="80%" paddingAngle={3}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {recentTransactions.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Recentes</h2>
            <button
              onClick={() => router.push('/transactions')}
              className="flex items-center gap-0.5 text-xs font-medium"
              style={{ color: 'var(--primary)' }}
            >
              Ver tudo <ChevronRight size={14} />
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentTransactions.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                {t.category ? (
                  <CategoryIcon icon={t.category.icon} color={t.category.color} size={16} />
                ) : (
                  <div className="w-8 h-8 rounded-xl" style={{ background: 'var(--muted)' }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {t.description}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {formatDateShort(t.date)} · {t.category?.name ?? 'Sem categoria'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold"
                    style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--foreground)' }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentTransactions.length === 0 && categoryData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🚀</p>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>Comece agora</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Registre sua primeira transação
          </p>
        </div>
      )}

      <QuickAddFAB onAdded={refresh} />
    </div>
  )
}
