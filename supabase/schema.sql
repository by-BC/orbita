-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'circle',
  color text not null default '#6366f1',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount decimal(12,2) not null,
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) on delete set null,
  date date not null,
  payment_method text not null check (payment_method in ('pix', 'credit', 'debit', 'cash', 'boleto', 'other')),
  status text not null default 'pending' check (status in ('paid', 'pending', 'overdue')),
  notes text,
  installment_id uuid,
  installment_number int,
  installment_total int,
  recurring_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Installments table
create table public.installments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  total_amount decimal(12,2) not null,
  installment_amount decimal(12,2) not null,
  total_installments int not null,
  first_due_date date not null,
  category_id uuid references public.categories(id) on delete set null,
  payment_method text not null check (payment_method in ('pix', 'credit', 'debit', 'cash', 'boleto', 'other')),
  notes text,
  created_at timestamptz default now()
);

-- Recurring payments table
create table public.recurring_payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount decimal(12,2) not null,
  frequency text not null default 'monthly' check (frequency in ('weekly', 'monthly', 'yearly')),
  due_day int not null check (due_day between 1 and 31),
  category_id uuid references public.categories(id) on delete set null,
  payment_method text not null check (payment_method in ('pix', 'credit', 'debit', 'cash', 'boleto', 'other')),
  is_active boolean default true,
  notes text,
  start_date date not null default current_date,
  created_at timestamptz default now()
);

-- Add foreign keys for installment_id and recurring_id after tables exist
alter table public.transactions
  add constraint transactions_installment_id_fkey
  foreign key (installment_id) references public.installments(id) on delete cascade;

alter table public.transactions
  add constraint transactions_recurring_id_fkey
  foreign key (recurring_id) references public.recurring_payments(id) on delete set null;

-- Row Level Security
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.installments enable row level security;
alter table public.recurring_payments enable row level security;

-- RLS Policies
create policy "Users manage own categories" on public.categories
  for all using (auth.uid() = user_id);

create policy "Users manage own transactions" on public.transactions
  for all using (auth.uid() = user_id);

create policy "Users manage own installments" on public.installments
  for all using (auth.uid() = user_id);

create policy "Users manage own recurring" on public.recurring_payments
  for all using (auth.uid() = user_id);

-- Function to insert default categories for new users
create or replace function public.create_default_categories()
returns trigger language plpgsql security definer as $$
begin
  insert into public.categories (user_id, name, icon, color, is_default) values
    (new.id, 'Alimentação', 'utensils', '#f97316', true),
    (new.id, 'Transporte', 'car', '#3b82f6', true),
    (new.id, 'Moradia', 'home', '#8b5cf6', true),
    (new.id, 'Saúde', 'heart-pulse', '#ef4444', true),
    (new.id, 'Lazer', 'gamepad-2', '#10b981', true),
    (new.id, 'Streaming', 'tv', '#ec4899', true),
    (new.id, 'Educação', 'graduation-cap', '#f59e0b', true),
    (new.id, 'Academia', 'dumbbell', '#06b6d4', true),
    (new.id, 'Cartão de Crédito', 'credit-card', '#6366f1', true),
    (new.id, 'Investimentos', 'trending-up', '#14b8a6', true),
    (new.id, 'Outros', 'circle-ellipsis', '#9ca3af', true);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_default_categories();

-- Indexes for performance
create index transactions_user_id_date_idx on public.transactions(user_id, date);
create index transactions_status_idx on public.transactions(status);
create index transactions_category_idx on public.transactions(category_id);
