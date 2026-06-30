'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '../services/authService'
import { useFormState } from '../hooks/useFormState'

export function RegisterInstitucionForm() {
  const router = useRouter()
  const { loading, error, run } = useFormState()

  const [fullName, setFullName] = useState('')
  const [nombreInstitucion, setNombreInstitucion] = useState('')
  const [tipoInstitucion, setTipoInstitucion] = useState('general')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await run(async () => {
      const { token } = await authService.register({
        email,
        password,
        fullName,
        role: 'institucion',
        nombreInstitucion,
        tipoInstitucion: tipoInstitucion as 'técnica' | 'comercial' | 'artística' | 'humanística' | 'científica' | 'general',
      })
      localStorage.setItem('inspira_token', token)
      router.push('/dashboard/institucion')
    })
  }

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400'

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
          🏫 Registrándote como Institución
        </span>
        <h1
          style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Registrar Institución
        </h1>
        <p className="text-gray-500">Crea una cuenta para tu entidad educativa</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Nombre completo (Responsable)
          </label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Nombre de la institución
          </label>
          <input
            className={inputClass}
            value={nombreInstitucion}
            onChange={(e) => setNombreInstitucion(e.target.value)}
            placeholder="Instituto San Vicente de Paul"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tipo de institución</label>
          <select
            className={inputClass}
            value={tipoInstitucion}
            onChange={(e) => setTipoInstitucion(e.target.value)}
            required
          >
            <option value="general">General</option>
            <option value="técnica">Técnica (Tecnología y Oficios)</option>
            <option value="comercial">Comercial (Finanzas y Marketing)</option>
            <option value="artística">Artística (Diseño y Marketing)</option>
            <option value="humanística">Humanística (Derecho y Ambiente)</option>
            <option value="científica">Científica (Salud, Tecnología y Ambiente)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email institucional</label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@institucion.edu"
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
          {loading ? 'Creando cuenta...' : 'Crear cuenta de institución'}
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
