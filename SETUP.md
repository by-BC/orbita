# Orbita — Setup Guide

## 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo `supabase/schema.sql`
3. Copie as credenciais em **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Ambiente local

```bash
cp .env.example .env.local
# Preencha com suas credenciais do Supabase
npm install
npm run dev
```

Acesse `http://localhost:3000`

## 3. Deploy na Vercel

1. Faça push para o GitHub
2. Import o repositório na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 4. Supabase Auth — Email confirmação

No Supabase Dashboard → Authentication → Email Templates:
- Customize o template de confirmação
- Ou desative "Enable email confirmations" para desenvolvimento

## Estrutura do projeto

```
src/
  app/
    (auth)/        # Login e cadastro
    (app)/         # Área autenticada
      dashboard/   # Dashboard principal
      transactions/ # Extrato financeiro
      reports/     # Relatórios
      settings/    # Categorias e recorrentes
  components/
    layout/        # TopBar, BottomNav
    transactions/  # Formulários (transação, parcelado, recorrente)
    ui/            # Componentes reutilizáveis
  lib/
    supabase/      # Cliente, servidor, middleware
    constants.ts   # Constantes (métodos, status, etc.)
    utils.ts       # Utilitários (formatação, datas)
  types/
    database.ts    # Tipos TypeScript do banco
supabase/
  schema.sql       # Schema completo do banco de dados
```
