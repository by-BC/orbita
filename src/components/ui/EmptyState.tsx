import { LucideProps } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ComponentType<LucideProps>
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--muted)' }}
      >
        <Icon size={28} style={{ color: 'var(--muted-foreground)' }} />
      </div>
      <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{title}</p>
      {description && (
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
      )}
      {action}
    </div>
  )
}
