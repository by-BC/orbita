'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PAYMENT_METHODS, TRANSACTION_STATUSES } from '@/lib/constants'
import type { Category, Transaction, TransactionType, PaymentMethod, TransactionStatus } from '@/types/database'

interface TransactionFormProps {
  defaultType?: TransactionType
  transaction?: Transaction
  onSuccess: () => void
  onCancel: () => void
}

export default function TransactionForm({
  defaultType = 'expense',
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [type, setType] = useState<TransactionType>(transaction?.type ?? defaultType)
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? '')
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction?.payment_method ?? 'pix')
  const [status, setStatus] = useState<TransactionStatus>(transaction?.status ?? 'paid')
  const [notes, setNotes] = useState(transaction?.notes ?? '')

  useEffect(() => {
    supabase.from('categories').select('*').order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      description,
      amount: parseFloat(amount),
      type,
      category_id: categoryId || null,
      date,
      payment_method: paymentMethod,
      status,
      notes: notes || null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tb = supabase.from('transactions') as any
    const { error } = transaction
      ? await tb.update(payload).eq('id', transaction.id)
      : await tb.insert(payload)

    if (error) {
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  const inputClass = "w-full px-3.5 py-3 rounded-xl text-sm outline-none"
  const inputStyle = {
    background: 'var(--muted)',
    border: '1.5px solid var(--border)',
    color: 'var(--foreground)',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      {/* Type toggle */}
      <div
        className="flex rounded-xl p-1"
        style={{ background: 'var(--muted)' }}
      >
        {(['expense', 'income'] as TransactionType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={type === t ? {
              background: t === 'expense' ? '#ef4444' : '#10b981',
              color: '#fff',
            } : { color: 'var(--muted-foreground)' }}
          >
            {t === 'expense' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Descrição *
        </label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Mercado, Salário..."
          required
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Valor *
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium"
            style={{ color: 'var(--muted-foreground)' }}>R$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            required
            className={`${inputClass} pl-9`}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Date and Category row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Data *
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Selecionar</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Forma de pagamento
        </label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setPaymentMethod(m.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={paymentMethod === m.value ? {
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              } : {
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Status
        </label>
        <div className="flex gap-2">
          {TRANSACTION_STATUSES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={status === s.value ? {
                background: s.value === 'paid' ? '#10b981' : s.value === 'pending' ? '#f59e0b' : '#ef4444',
                color: '#fff',
              } : {
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Observação
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Opcional"
          rows={2}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </div>

      {error && <p className="text-sm text-center" style={{ color: 'var(--destructive)' }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {transaction ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
