'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, RefreshCw, Tag, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants'
import type { Category, RecurringPayment } from '@/types/database'
import Modal from '@/components/ui/Modal'
import CategoryIcon from '@/components/ui/CategoryIcon'
import RecurringForm from '@/components/transactions/RecurringForm'

type RecurringWithCat = RecurringPayment & { category?: Category | null }

interface Props {
  initialCategories: Category[]
  initialRecurring: RecurringWithCat[]
}

type Tab = 'categories' | 'recurring'

export default function SettingsClient({ initialCategories, initialRecurring }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('categories')
  const [categories, setCategories] = useState(initialCategories)
  const [recurring, setRecurring] = useState(initialRecurring)

  // Category form state
  const [catModal, setCatModal] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('circle-ellipsis')
  const [catColor, setCatColor] = useState('#6366f1')
  const [catLoading, setCatLoading] = useState(false)
  const [deleteCat, setDeleteCat] = useState<Category | null>(null)

  // Recurring state
  const [recurringModal, setRecurringModal] = useState(false)
  const [editRecurring, setEditRecurring] = useState<RecurringWithCat | null>(null)
  const [deleteRecurring, setDeleteRecurring] = useState<RecurringWithCat | null>(null)

  function openNewCat() {
    setEditCat(null)
    setCatName('')
    setCatIcon('circle-ellipsis')
    setCatColor('#6366f1')
    setCatModal(true)
  }

  function openEditCat(cat: Category) {
    setEditCat(cat)
    setCatName(cat.name)
    setCatIcon(cat.icon)
    setCatColor(cat.color)
    setCatModal(true)
  }

  async function saveCat() {
    if (!catName.trim()) return
    setCatLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catTb = supabase.from('categories') as any
    if (editCat) {
      const { data } = await catTb
        .update({ name: catName, icon: catIcon, color: catColor })
        .eq('id', editCat.id)
        .select()
        .single()
      if (data) setCategories(prev => prev.map(c => c.id === editCat.id ? (data as Category) : c))
    } else {
      const { data } = await catTb
        .insert({ user_id: user.id, name: catName, icon: catIcon, color: catColor })
        .select()
        .single()
      if (data) setCategories(prev => [...prev, data as Category])
    }
    setCatModal(false)
    setCatLoading(false)
  }

  async function confirmDeleteCat() {
    if (!deleteCat) return
    await supabase.from('categories').delete().eq('id', deleteCat.id)
    setCategories(prev => prev.filter(c => c.id !== deleteCat.id))
    setDeleteCat(null)
  }

  async function confirmDeleteRecurring() {
    if (!deleteRecurring) return
    await supabase.from('recurring_payments').delete().eq('id', deleteRecurring.id)
    setRecurring(prev => prev.filter(r => r.id !== deleteRecurring.id))
    setDeleteRecurring(null)
  }

  async function toggleRecurring(r: RecurringWithCat) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('recurring_payments') as any)
      .update({ is_active: !r.is_active })
      .eq('id', r.id)
      .select()
      .single()
    if (data) setRecurring(prev => prev.map(x => x.id === r.id ? { ...x, ...(data as RecurringPayment) } : x))
  }

  async function reloadRecurring() {
    const { data } = await supabase
      .from('recurring_payments')
      .select('*, category:categories(*)')
      .order('description')
    if (data) setRecurring(data)
  }

  const tabStyle = (active: boolean) => ({
    color: active ? 'var(--primary)' : 'var(--muted-foreground)',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
  })

  return (
    <div className="max-w-lg mx-auto">
      {/* Tabs */}
      <div className="flex border-b sticky top-14 z-20"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
        <button onClick={() => setTab('categories')}
          className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={tabStyle(tab === 'categories')}>
          <Tag size={16} /> Categorias
        </button>
        <button onClick={() => setTab('recurring')}
          className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={tabStyle(tab === 'recurring')}>
          <RefreshCw size={16} /> Recorrentes
        </button>
      </div>

      <div className="px-4 py-4">
        {tab === 'categories' && (
          <div className="space-y-3">
            <button onClick={openNewCat}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <Plus size={18} /> Nova categoria
            </button>

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {categories.map((cat, i) => (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3"
                  style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                  <CategoryIcon icon={cat.icon} color={cat.color} size={16} />
                  <p className="flex-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {cat.name}
                  </p>
                  <div className="flex gap-1">
                    <button onClick={() => openEditCat(cat)}
                      className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
                      <Pencil size={14} />
                    </button>
                    {!cat.is_default && (
                      <button onClick={() => setDeleteCat(cat)}
                        className="p-1.5 rounded-lg" style={{ color: 'var(--destructive)' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'recurring' && (
          <div className="space-y-3">
            <button onClick={() => { setEditRecurring(null); setRecurringModal(true) }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <Plus size={18} /> Novo pagamento recorrente
            </button>

            {recurring.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">🔄</p>
                <p className="font-semibold" style={{ color: 'var(--foreground)' }}>Nenhum recorrente</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Cadastre Netflix, aluguel, academia...
                </p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {recurring.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3"
                    style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                    {r.category ? (
                      <CategoryIcon icon={r.category.icon} color={r.category.color} size={14} />
                    ) : (
                      <div className="w-8 h-8 rounded-xl" style={{ background: 'var(--muted)' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {r.description}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Dia {r.due_day} · {r.category?.name ?? 'Sem categoria'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {formatCurrency(r.amount)}
                      </p>
                      <button onClick={() => toggleRecurring(r)}
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={r.is_active
                          ? { background: '#d1fae5', color: '#065f46' }
                          : { background: '#fee2e2', color: '#991b1b' }}>
                        {r.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                      <button onClick={() => { setEditRecurring(r); setRecurringModal(true) }}
                        className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteRecurring(r)}
                        className="p-1.5 rounded-lg" style={{ color: 'var(--destructive)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)}
        title={editCat ? 'Editar categoria' : 'Nova categoria'}>
        <div className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Nome</label>
            <input type="text" value={catName} onChange={e => setCatName(e.target.value)}
              placeholder="Nome da categoria" autoFocus
              className="w-full px-3.5 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Ícone</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setCatIcon(icon)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: catIcon === icon ? catColor + '30' : 'var(--muted)',
                    border: catIcon === icon ? `2px solid ${catColor}` : '2px solid transparent',
                  }}>
                  <CategoryIcon icon={icon} color={catIcon === icon ? catColor : '#9ca3af'} size={14}
                    className="!bg-transparent !w-auto !h-auto" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Cor</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map(color => (
                <button key={color} type="button" onClick={() => setCatColor(color)}
                  className="w-8 h-8 rounded-full transition-transform"
                  style={{
                    background: color,
                    transform: catColor === color ? 'scale(1.2)' : 'scale(1)',
                    outline: catColor === color ? `3px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
            <CategoryIcon icon={catIcon} color={catColor} size={16} />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              {catName || 'Nome da categoria'}
            </span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setCatModal(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              Cancelar
            </button>
            <button type="button" onClick={saveCat} disabled={catLoading || !catName.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {catLoading && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete category modal */}
      <Modal open={!!deleteCat} onClose={() => setDeleteCat(null)} title="Excluir categoria">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Excluir <strong style={{ color: 'var(--foreground)' }}>{deleteCat?.name}</strong>?
            As transações desta categoria perderão a associação.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteCat(null)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              Cancelar
            </button>
            <button onClick={confirmDeleteCat}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--destructive)', color: '#fff' }}>
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      {/* Recurring modal */}
      <Modal open={recurringModal} onClose={() => setRecurringModal(false)}
        title={editRecurring ? 'Editar recorrente' : 'Novo recorrente'}>
        <RecurringForm
          recurring={editRecurring ?? undefined}
          onSuccess={() => { setRecurringModal(false); reloadRecurring() }}
          onCancel={() => setRecurringModal(false)}
        />
      </Modal>

      {/* Delete recurring modal */}
      <Modal open={!!deleteRecurring} onClose={() => setDeleteRecurring(null)} title="Excluir recorrente">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Excluir <strong style={{ color: 'var(--foreground)' }}>{deleteRecurring?.description}</strong>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteRecurring(null)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              Cancelar
            </button>
            <button onClick={confirmDeleteRecurring}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--destructive)', color: '#fff' }}>
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
