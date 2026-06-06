'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#d1fae5' }}>
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Conta criada!</h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Verifique seu e-mail para confirmar o cadastro. Redirecionando...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--primary)' }}>
            <span className="text-white text-2xl font-bold">O</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Criar conta</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Comece a controlar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                style={{ background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--muted-foreground)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-center" style={{ color: 'var(--destructive)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Criar conta
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
