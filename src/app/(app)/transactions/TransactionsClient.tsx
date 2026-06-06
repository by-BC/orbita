'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Filter, Pencil, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getMonthDateRange, formatMonthYear } from '@/lib/utils'
import { PAYMENT_METHODS, TRANSACTION_STATUSES, MONTHS } from '@/lib/constants'
import type { Category, Transaction, TransactionStatus, TransactionType, PaymentMethod } from '@/types/database'
import CategoryIcon from '@/components/ui/CategoryIcon'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import TransactionForm from '@/components/transactions/TransactionForm'
import QuickAddFAB from '@/components/transactions/QuickAddFAB'
import EmptyState from '@/components/ui/EmptyState'
import { ArrowLeftRight } from 'lucide-react'

type TxWithCategory = Transaction & { category?: Category | null }

interface Props {
  initialTransactions: TxWithCategory[]
  categories: Category[]
  year: number
  month: number
}

export default function TransactionsClient({ initialTransactions, categories, year: initYear, month: initMonth }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [year, setYear] = useState(initYear)
  const [month, setMonth] = useState(initMonth)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [editTx, setEditTx] = useState<TxWithCategory | null>(null)
  const [deleteTx, setDeleteTx] = useState<TxWithCategory | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [filterType, setFilterType] = useState<TransactionType | ''>('')
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | ''>('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('')

  async function loadMonth(y: number, m: number) {
    setLoading(true)
    const { start, end } = getMonthDateRange(y, m)
    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })
    setTransactions(data ?? [])
    setLoading(false)
  }

  function prevMonth() {
    const d = new Date(year, month - 2, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    loadMonth(d.getFullYear(), d.getMonth() + 1)
  }

  function nextMonth() {
    const d = new Date(year, month, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    loadMonth(d.getFullYear(), d.getMonth() + 1)
  }

  async function deleteTransaction() {
    if (!deleteTx) return
    await supabase.from('transactions').delete().eq('id', deleteTx.id)
    setTransactions(prev => prev.filter(t => t.id !== deleteTx.id))
    setDeleteTx(null)
  }

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filterType && t.type !== filterType) return false
      if (filterStatus && t.status !== filterStatus) return false
      if (filterCategory && t.category_id !== filterCategory) return false
      if (filterMethod && t.payment_method !== filterMethod) return false
      return true
    })
  }, [transactions, filterType, filterStatus, filterCategory, filterMethod])

  const hasFilters = filterType || filterStatus || filterCategory || filterMethod

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const inputStyle = { background: 'var(--muted)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }

  return (
    <div className="max-w-lg mx-auto">
      {/* Month nav */}
      <div className="sticky top-14 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={prevMonth} className="p-2 rounded-lg" style={{ color: 'var(--foreground)' }}>
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold capitalize" style={{ color: 'var(--foreground)' }}>
          {formatMonthYear(year, month)}
        </span>
        <button onClick={nextMonth} className="p-2 rounded-lg" style={{ color: 'var(--foreground)' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: '#d1fae5' }}>
            <p className="text-xs font-medium" style={{ color: '#065f46' }}>Receitas</p>
            <p className="text-base font-bold" style={{ color: '#065f46' }}>{formatCurrency(totalIncome)}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#fee2e2' }}>
            <p className="text-xs font-medium" style={{ color: '#991b1b' }}>Despesas</p>
            <p className="text-base font-bold" style={{ color: '#991b1b' }}>{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        {/* Filter button */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {filtered.length} lançamento{filtered.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: hasFilters ? 'var(--primary)' : 'var(--muted)',
              color: hasFilters ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}
          >
            <Filter size={13} />
            {hasFilters ? 'Filtros ativos' : 'Filtrar'}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Tipo</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value as TransactionType | '')}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">Todos</option>
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TransactionStatus | '')}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">Todos</option>
                  {TRANSACTION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Categoria</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">Todas</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Pagamento</label>
                <select value={filterMethod} onChange={e => setFilterMethod(e.target.value as PaymentMethod | '')}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">Todos</option>
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={() => { setFilterType(''); setFilterStatus(''); setFilterCategory(''); setFilterMethod('') }}
                className="text-xs font-medium flex items-center gap-1"
                style={{ color: 'var(--destructive)' }}
              >
                <X size={12} /> Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Transaction list */}
        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Nenhum lançamento"
            description="Registre sua primeira transação neste mês"
          />
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {filtered.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-4 py-3"
                style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}
              >
                {t.category ? (
                  <CategoryIcon icon={t.category.icon} color={t.category.color} size={16} />
                ) : (
                  <div className="w-8 h-8 rounded-xl" style={{ background: 'var(--muted)' }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {formatDate(t.date)}
                    </p>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-semibold"
                    style={{ color: t.type === 'income' ? '#10b981' : 'var(--foreground)' }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <div className="flex gap-1">
                    <button onClick={() => setEditTx(t)} className="p-1.5 rounded-lg"
                      style={{ color: 'var(--muted-foreground)' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTx(t)} className="p-1.5 rounded-lg"
                      style={{ color: 'var(--destructive)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Editar transação">
        {editTx && (
          <TransactionForm
            transaction={editTx}
            onSuccess={() => { setEditTx(null); loadMonth(year, month) }}
            onCancel={() => setEditTx(null)}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteTx} onClose={() => setDeleteTx(null)} title="Excluir transação">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Tem certeza que deseja excluir <strong style={{ color: 'var(--foreground)' }}>{deleteTx?.description}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTx(null)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              Cancelar
            </button>
            <button onClick={deleteTransaction}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--destructive)', color: '#fff' }}>
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      <QuickAddFAB onAdded={() => loadMonth(year, month)} />
    </div>
  )
}
