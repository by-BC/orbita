'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PAYMENT_METHODS, FREQUENCIES } from '@/lib/constants'
import type { Category, PaymentMethod, Frequency, RecurringPayment } from '@/types/database'

export default function RecurringForm({
  recurring,
  onSuccess,
  onCancel,
}: {
  recurring?: RecurringPayment
  onSuccess: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [description, setDescription] = useState(recurring?.description ?? '')
  const [amount, setAmount] = useState(recurring ? String(recurring.amount) : '')
  const [frequency, setFrequency] = useState<Frequency>(recurring?.frequency ?? 'monthly')
  const [dueDay, setDueDay] = useState(recurring?.due_day ?? 1)
  const [categoryId, setCategoryId] = useState(recurring?.category_id ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(recurring?.payment_method ?? 'pix')
  const [isActive, setIsActive] = useState(recurring?.is_active ?? true)
  const [notes, setNotes] = useState(recurring?.notes ?? '')

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
      frequency,
      due_day: dueDay,
      category_id: categoryId || null,
      payment_method: paymentMethod,
      is_active: isActive,
      notes: notes || null,
      start_date: new Date().toISOString().split('T')[0],
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tb = supabase.from('recurring_payments') as any
    const { error } = recurring
      ? await tb.update(payload).eq('id', recurring.id)
      : await tb.insert(payload)

    if (error) {
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  const inputStyle = {
    background: 'var(--muted)',
    border: '1.5px solid var(--border)',
    color: 'var(--foreground)',
  }
  const inputClass = "w-full px-3.5 py-3 rounded-xl text-sm outline-none"

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Descrição *
        </label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Netflix, Aluguel, Academia..." required
          className={inputClass} style={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Valor *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-foreground)' }}>R$</span>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" required className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Dia vencimento *</label>
          <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(parseInt(e.target.value))}
            required className={inputClass} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Frequência</label>
        <div className="flex gap-2">
          {FREQUENCIES.map(f => (
            <button key={f.value} type="button" onClick={() => setFrequency(f.value)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={frequency === f.value ? {
                background: 'var(--primary)', color: 'var(--primary-foreground)',
              } : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Categoria</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className={inputClass} style={inputStyle}>
            <option value="">Selecionar</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Status</label>
          <button type="button" onClick={() => setIsActive(a => !a)}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all"
            style={isActive ? {
              background: '#d1fae5', color: '#065f46',
            } : { background: '#fee2e2', color: '#991b1b', border: '1px solid var(--border)' }}>
            {isActive ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Forma de pagamento
        </label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(m => (
            <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={paymentMethod === m.value ? {
                background: 'var(--primary)', color: 'var(--primary-foreground)',
              } : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Observação</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional"
          rows={2} className={`${inputClass} resize-none`} style={inputStyle} />
      </div>

      {error && <p className="text-sm text-center" style={{ color: 'var(--destructive)' }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          {loading && <Loader2 size={14} className="animate-spin" />}
          {recurring ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
