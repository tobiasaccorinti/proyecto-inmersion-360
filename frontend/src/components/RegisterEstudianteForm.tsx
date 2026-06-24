'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '../services/authService'
import { useFormState } from '../hooks/useFormState'

export function RegisterEstudianteForm() {
  const router = useRouter()
  const { loading, error, run } = useFormState()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigoAlumno, setCodigoAlumno] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await run(async () => {
      const { token } = await authService.register({
        email,
        password,
        fullName,
        role: 'estudiante',
        codigoAlumno,
      })
      localStorage.setItem('inspira_token', token)
      router.push('/dashboard/estudiante')
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
          ¡Hola Estudiante!
        </h1>
        <p className="text-gray-500">Completá tus datos para empezar a explorar.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nombre completo</label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>

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
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Código de alumno</label>
          <input
            className={inputClass}
            value={codigoAlumno}
            onChange={(e) => setCodigoAlumno(e.target.value)}
            placeholder="INST-XXXX-XXXX"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Pedíselo a tu institución educativa.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Contraseña</label>
          <div className="relative">
            <input
              className={inputClass}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
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
          className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Creando cuenta...' : 'Registrarme como estudiante'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
