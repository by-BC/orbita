import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateShort(date: string): string {
  return format(parseISO(date), 'dd/MM', { locale: ptBR })
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

export function getCurrentMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function getMonthDateRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Atrasado' }
  return map[status] ?? status
}

export function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    pix: 'Pix', credit: 'Crédito', debit: 'Débito',
    cash: 'Dinheiro', boleto: 'Boleto', other: 'Outro',
  }
  return map[method] ?? method
}
