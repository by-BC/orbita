import type { PaymentMethod, TransactionStatus, Frequency } from '@/types/database'

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit', label: 'Crédito' },
  { value: 'debit', label: 'Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'other', label: 'Outro' },
]

export const TRANSACTION_STATUSES: { value: TransactionStatus; label: string }[] = [
  { value: 'paid', label: 'Pago' },
  { value: 'pending', label: 'Pendente' },
  { value: 'overdue', label: 'Atrasado' },
]

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
]

export const CATEGORY_ICONS = [
  'utensils', 'car', 'home', 'heart-pulse', 'gamepad-2', 'tv',
  'graduation-cap', 'dumbbell', 'credit-card', 'trending-up',
  'circle-ellipsis', 'shopping-cart', 'briefcase', 'plane',
  'music', 'book', 'coffee', 'dog', 'baby', 'gift',
  'zap', 'wifi', 'phone', 'shirt', 'wrench', 'piggy-bank',
]

export const CATEGORY_COLORS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981',
  '#ec4899', '#f59e0b', '#06b6d4', '#6366f1', '#14b8a6',
  '#9ca3af', '#84cc16', '#a855f7', '#f43f5e', '#0ea5e9',
  '#22c55e', '#eab308', '#64748b', '#78716c', '#d946ef',
]

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
