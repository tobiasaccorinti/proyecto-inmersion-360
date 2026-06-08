'use client'

/**
 * Formulario de inicio de sesión.
 * Consume el backend via authService y guarda el JWT en localStorage.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '../services/authService'
import { useFormState } from '../hooks/useFormState'

export function LoginForm() {
  const router = useRouter()
  const { loading, error, run } = useFormState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await run(async () => {
      const { token, profile } = await authService.login({ email, password })
      localStorage.setItem('inspira_token', token)
      // Redirigir según rol
      if (profile.role === 'estudiante') router.push('/dashboard/estudiante')
      else if (profile.role === 'empresa') router.push('/dashboard/empresa')
      else router.push('/dashboard/institucion')
    })
  }

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400'

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1
          style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Iniciar sesión
        </h1>
        <p className="text-gray-500">Ingresá a tu cuenta de Inspira</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Contraseña</label>
          <div className="relative">
            <input
              className={inputClass}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Ingresando...' : 'Ingresar →'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        ¿No tenés cuenta?{' '}
        <Link href="/auth/register" className="text-indigo-600 font-semibold hover:underline">
          Registrate gratis
        </Link>
      </p>
    </div>
  )
}
