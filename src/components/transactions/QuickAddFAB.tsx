'use client'

import { useState } from 'react'
import { Plus, X, TrendingDown, TrendingUp, CreditCard, RefreshCw } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import TransactionForm from './TransactionForm'
import InstallmentForm from './InstallmentForm'
import RecurringForm from './RecurringForm'

type ModalType = 'expense' | 'income' | 'installment' | 'recurring' | null

export default function QuickAddFAB({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)

  function openModal(type: ModalType) {
    setOpen(false)
    setModal(type)
  }

  function handleSuccess() {
    setModal(null)
    onAdded?.()
  }

  const actions = [
    { type: 'expense' as const, icon: TrendingDown, label: 'Despesa', color: '#ef4444' },
    { type: 'income' as const, icon: TrendingUp, label: 'Receita', color: '#10b981' },
    { type: 'installment' as const, icon: CreditCard, label: 'Parcelado', color: '#f59e0b' },
    { type: 'recurring' as const, icon: RefreshCw, label: 'Recorrente', color: '#6366f1' },
  ]

  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3">
        {open && (
          <>
            <div className="fixed inset-0" onClick={() => setOpen(false)} />
            {actions.map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                onClick={() => openModal(type)}
                className="relative flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-lg"
                style={{ background: color, color: '#fff' }}
              >
                <Icon size={16} />
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {open ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {/* Modals */}
      <Modal
        open={modal === 'expense' || modal === 'income'}
        onClose={() => setModal(null)}
        title={modal === 'income' ? 'Nova Receita' : 'Nova Despesa'}
      >
        <TransactionForm
          defaultType={modal === 'income' ? 'income' : 'expense'}
          onSuccess={handleSuccess}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal open={modal === 'installment'} onClose={() => setModal(null)} title="Compra Parcelada">
        <InstallmentForm onSuccess={handleSuccess} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'recurring'} onClose={() => setModal(null)} title="Pagamento Recorrente">
        <RecurringForm onSuccess={handleSuccess} onCancel={() => setModal(null)} />
      </Modal>
    </>
  )
}
