'use client'

/**
 * Formulario de registro en dos pasos:
 * 1. Elegir rol (estudiante / institución / empresa)
 * 2. Completar datos según rol
 *
 * Consume el backend via authService y guarda el JWT en localStorage.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '../services/authService'
import { useFormState } from '../hooks/useFormState'
import type { Role } from '../types'

type Step = 'role' | 'datos'

const roles = [
  { value: 'estudiante' as Role, label: 'Estudiante', desc: 'Explorá experiencias por interés', icon: '🎓' },
  { value: 'institucion' as Role, label: 'Institución', desc: 'Coordiná experiencias para tus alumnos', icon: '🏫' },
  { value: 'empresa' as Role, label: 'Empresa / Profesional', desc: 'Publicá charlas y medí tu impacto', icon: '🏢' },
]

export function RegisterForm() {
  const router = useRouter()
  const { loading, error, run } = useFormState()

  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<Role>('estudiante')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [codigoAlumno, setCodigoAlumno] = useState('')
  const [nombreInstitucion, setNombreInstitucion] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await run(async () => {
      const { token } = await authService.register({
        email, password, fullName, role,
        codigoAlumno: role === 'estudiante' ? codigoAlumno : undefined,
        nombreInstitucion: role === 'institucion' ? nombreInstitucion : undefined,
      })
      localStorage.setItem('inspira_token', token)
      router.push('/dashboard')
    })
  }

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400'

  return (
    <div className="w-full max-w-md">
      {/* STEP 1 — Elegir rol */}
      {step === 'role' && (
        <>
          <div className="mb-8">
            <h1
              style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Crear cuenta
            </h1>
            <p className="text-gray-500">¿Cómo vas a usar Inspira?</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  role === r.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep('datos')}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Continuar →
          </button>

          <p className="text-sm text-gray-500 text-center mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </>
      )}

      {/* STEP 2 — Datos según rol */}
      {step === 'datos' && (
        <>
          <div className="mb-8">
            <button
              onClick={() => setStep('role')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h1
              style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Tus datos
            </h1>
            <p className="text-gray-500 capitalize">{role}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                {role === 'empresa' ? 'Nombre de empresa' : 'Nombre completo'}
              </label>
              <input
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'empresa' ? 'ProductoLab S.A.' : 'Juan García'}
                required
              />
            </div>

            {role === 'institucion' && (
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
            )}

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

            {role === 'estudiante' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Código de alumno
                </label>
                <input
                  className={inputClass}
                  value={codigoAlumno}
                  onChange={(e) => setCodigoAlumno(e.target.value.toUpperCase())}
                  placeholder="ISVN-X7K2-9M4P"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Código entregado por tu institución educativa
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
