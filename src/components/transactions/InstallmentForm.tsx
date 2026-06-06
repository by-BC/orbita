'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { Category, PaymentMethod } from '@/types/database'
import { addMonths, format } from 'date-fns'

export default function InstallmentForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [totalInstallments, setTotalInstallments] = useState('12')
  const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const installmentAmount = totalAmount
    ? (parseFloat(totalAmount) / parseInt(totalInstallments || '1')).toFixed(2)
    : '0.00'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const total = parseFloat(totalAmount)
    const count = parseInt(totalInstallments)
    const instAmt = total / count

    const installmentPayload = {
      user_id: user.id,
      description,
      total_amount: total,
      installment_amount: instAmt,
      total_installments: count,
      first_due_date: firstDueDate,
      category_id: categoryId || null,
      payment_method: paymentMethod,
      notes: notes || null,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: installment, error: installErr } = await (supabase.from('installments') as any)
      .insert(installmentPayload)
      .select()
      .single()

    if (installErr || !installment) {
      setError('Erro ao criar parcelamento.')
      setLoading(false)
      return
    }

    // Generate installment transactions
    const transactions = Array.from({ length: count }, (_, i) => {
      const dueDate = addMonths(new Date(firstDueDate + 'T12:00:00'), i)
      return {
        user_id: user.id,
        description: `${description} (${i + 1}/${count})`,
        amount: instAmt,
        type: 'expense' as const,
        category_id: categoryId || null,
        date: format(dueDate, 'yyyy-MM-dd'),
        payment_method: paymentMethod,
        status: 'pending' as const,
        notes: notes || null,
        installment_id: installment.id,
        installment_number: i + 1,
        installment_total: count,
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: txError } = await (supabase.from('transactions') as any).insert(transactions)
    if (txError) {
      setError('Parcelas criadas parcialmente. Verifique o extrato.')
    }
    onSuccess()
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
          placeholder="Ex: iPhone 16, TV Samsung..." required className={inputClass} style={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Valor total *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-foreground)' }}>R$</span>
            <input type="number" step="0.01" min="0.01" value={totalAmount}
              onChange={e => setTotalAmount(e.target.value)} placeholder="0,00" required
              className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Nº de parcelas *
          </label>
          <input type="number" min="2" max="120" value={totalInstallments}
            onChange={e => setTotalInstallments(e.target.value)} required
            className={inputClass} style={inputStyle} />
        </div>
      </div>

      {totalAmount && (
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--muted)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Valor por parcela</p>
          <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
            R$ {parseFloat(installmentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            1ª parcela *
          </label>
          <input type="date" value={firstDueDate} onChange={e => setFirstDueDate(e.target.value)}
            required className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Categoria
          </label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className={inputClass} style={inputStyle}>
            <option value="">Selecionar</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Opcional" rows={2} className={`${inputClass} resize-none`} style={inputStyle} />
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
          Parcelar
        </button>
      </div>
    </form>
  )
}
