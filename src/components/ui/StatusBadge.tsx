import type { TransactionStatus } from '@/types/database'

const config: Record<TransactionStatus, { label: string; bg: string; text: string }> = {
  paid: { label: 'Pago', bg: '#d1fae5', text: '#065f46' },
  pending: { label: 'Pendente', bg: '#fef3c7', text: '#92400e' },
  overdue: { label: 'Atrasado', bg: '#fee2e2', text: '#991b1b' },
}

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, bg, text } = config[status]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  )
}
