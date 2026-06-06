export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'boleto' | 'other'
export type TransactionStatus = 'paid' | 'pending' | 'overdue'
export type TransactionType = 'income' | 'expense'
export type Frequency = 'weekly' | 'monthly' | 'yearly'

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: TransactionType
  category_id: string | null
  date: string
  payment_method: PaymentMethod
  status: TransactionStatus
  notes: string | null
  installment_id: string | null
  installment_number: number | null
  installment_total: number | null
  recurring_id: string | null
  created_at: string
  updated_at: string
  category?: Category | null
}

export interface Installment {
  id: string
  user_id: string
  description: string
  total_amount: number
  installment_amount: number
  total_installments: number
  first_due_date: string
  category_id: string | null
  payment_method: PaymentMethod
  notes: string | null
  created_at: string
  category?: Category | null
}

export interface RecurringPayment {
  id: string
  user_id: string
  description: string
  amount: number
  frequency: Frequency
  due_day: number
  category_id: string | null
  payment_method: PaymentMethod
  is_active: boolean
  notes: string | null
  start_date: string
  created_at: string
  category?: Category | null
}

type CategoryInsert = {
  user_id: string
  name: string
  icon?: string
  color?: string
  is_default?: boolean
}

type CategoryUpdate = {
  name?: string
  icon?: string
  color?: string
  is_default?: boolean
}

type TransactionInsert = {
  user_id: string
  description: string
  amount: number
  type: TransactionType
  category_id?: string | null
  date: string
  payment_method: PaymentMethod
  status?: TransactionStatus
  notes?: string | null
  installment_id?: string | null
  installment_number?: number | null
  installment_total?: number | null
  recurring_id?: string | null
}

type TransactionUpdate = Partial<Omit<TransactionInsert, 'user_id'>>

type InstallmentInsert = {
  user_id: string
  description: string
  total_amount: number
  installment_amount: number
  total_installments: number
  first_due_date: string
  category_id?: string | null
  payment_method: PaymentMethod
  notes?: string | null
}

type InstallmentUpdate = Partial<Omit<InstallmentInsert, 'user_id'>>

type RecurringInsert = {
  user_id: string
  description: string
  amount: number
  frequency?: Frequency
  due_day: number
  category_id?: string | null
  payment_method: PaymentMethod
  is_active?: boolean
  notes?: string | null
  start_date?: string
}

type RecurringUpdate = Partial<Omit<RecurringInsert, 'user_id'>>

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
      installments: {
        Row: Installment
        Insert: InstallmentInsert
        Update: InstallmentUpdate
      }
      recurring_payments: {
        Row: RecurringPayment
        Insert: RecurringInsert
        Update: RecurringUpdate
      }
    }
  }
}
