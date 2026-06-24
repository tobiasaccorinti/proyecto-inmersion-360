'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.user) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "var(--font-body, sans-serif)" }}>

      {/* PANEL IZQUIERDO */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-white font-bold text-lg">Inspira</span>
        </Link>

        <div>
          <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-bold text-white leading-tight mb-4">
            Bienvenido<br />de vuelta
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Conectamos estudiantes secundarios con profesionales y empresas mediante experiencias reales elegidas por interés propio.
          </p>
        </div>

        <div className="flex gap-8">
          {[
            { num: '120+', label: 'experiencias' },
            { num: '4.500', label: 'estudiantes' },
            { num: '25', label: 'empresas' },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-white">{s.num}</p>
              <p className="text-indigo-300 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="flex-1 bg-[#EEEFFE] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl font-bold text-gray-900 mb-2">
              Iniciar sesión
            </h1>
            <p className="text-gray-500">Ingresá a tu cuenta de Inspira</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
              <input
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-full py-3.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión →'}
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿No tenés cuenta?{' '}
              <Link href="/auth/register" className="text-indigo-600 font-semibold hover:underline">
                Registrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}