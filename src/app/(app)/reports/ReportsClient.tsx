'use client'

import { useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'
import { MONTHS } from '@/lib/constants'
import type { Transaction, RecurringPayment, Category, TransactionType } from '@/types/database'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'

type TxWithCategory = Transaction & { category?: Category | null }
type RecurringWithCategory = RecurringPayment & { category?: Category | null }

interface Props {
  transactions: TxWithCategory[]
  recurringPayments: RecurringWithCategory[]
}

export default function ReportsClient({ transactions, recurringPayments }: Props) {
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {}
    transactions.forEach(t => {
      const [y, m] = t.date.split('-')
      const key = `${y}-${m}`
      if (!map[key]) {
        map[key] = { month: `${MONTHS[parseInt(m) - 1].slice(0, 3)}`, income: 0, expense: 0 }
      }
      if (t.type === 'income') map[key].income += t.amount
      else map[key].expense += t.amount
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  }, [transactions])

  const categoryData = useMemo(() => {
    const map: Record<string, { name: string; color: string; amount: number }> = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const key = t.category_id ?? 'other'
      if (!map[key]) {
        map[key] = {
          name: t.category?.name ?? 'Outros',
          color: t.category?.color ?? '#9ca3af',
          amount: 0,
        }
      }
      map[key].amount += t.amount
    })
    return Object.values(map).sort((a, b) => b.amount - a.amount)
  }, [transactions])

  const totalInstallmentsPending = transactions
    .filter(t => t.installment_id && (t.status === 'pending' || t.status === 'overdue'))
    .reduce((s, t) => s + t.amount, 0)

  const activeRecurring = recurringPayments.filter(r => r.is_active)
  const totalRecurring = activeRecurring.reduce((s, r) => s + r.amount, 0)
  const inactiveRecurring = recurringPayments.filter(r => !r.is_active)

  const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)' }
  const tooltipStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--foreground)',
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Relatórios</h1>

      {/* Monthly evolution */}
      {monthlyData.length > 0 && (
        <div className="rounded-xl p-4" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Evolução mensal
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={2}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={35} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#10b981' }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#ef4444' }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Despesas</span>
            </div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="rounded-xl p-4" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Gastos por categoria (últimos 6 meses)
          </h2>
          <div className="space-y-2">
            {categoryData.map((cat, i) => {
              const pct = (cat.amount / categoryData.reduce((s, c) => s + c.amount, 0)) * 100
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--foreground)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      {formatCurrency(cat.amount)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--muted)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Installments pending */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          Parcelas futuras
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total pendente em parcelas</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>
              {formatCurrency(totalInstallmentsPending)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: '#fef3c7' }}>
            <span className="text-xl">💳</span>
          </div>
        </div>
      </div>

      {/* Recurring */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          Recorrências
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3" style={{ background: '#d1fae5' }}>
            <p className="text-xs font-medium" style={{ color: '#065f46' }}>Ativas</p>
            <p className="text-lg font-bold" style={{ color: '#065f46' }}>{activeRecurring.length}</p>
            <p className="text-xs" style={{ color: '#065f46' }}>{formatCurrency(totalRecurring)}/mês</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Inativas</p>
            <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{inactiveRecurring.length}</p>
          </div>
        </div>

        {activeRecurring.length > 0 && (
          <div className="space-y-2">
            {activeRecurring.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-t"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{r.description}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Dia {r.due_day} · {r.category?.name ?? 'Sem categoria'}
                  </p>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(r.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
