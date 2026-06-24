'use client'

/**
 * Formulario de registro: elecci�n de rol y redirecci�n.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Role } from '../types'

const roles = [
  { value: 'estudiante' as Role, label: 'Estudiante', desc: 'Explorá experiencias por interés', icon: '🎓' },
  { value: 'institucion' as Role, label: 'Institución', desc: 'Coordiná experiencias para tus alumnos', icon: '🏫' },
  { value: 'empresa' as Role, label: 'Empresa / Profesional', desc: 'Publicá charlas y medí tu impacto', icon: '🏢' },
]

export function RegisterForm() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('estudiante')

  function handleContinue() {
    if (role === 'estudiante') router.push('/auth/register/estudiante')
    else if (role === 'institucion') router.push('/auth/register/institucion')
    else if (role === 'empresa') router.push('/auth/register/empresa')
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-400 hover:text-indigo-600 mb-6 transition-colors group"
      >
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
        Volver al inicio
      </Link>
      <div className="mb-8">
        <h1
          style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Crear cuenta
        </h1>
        <p className="text-gray-500">Cómo vas a usar Inspira?</p>
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
        onClick={handleContinue}
        className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Continuar
      </button>

      <p className="text-sm text-gray-500 text-center mt-6">
        ¿Ya tenés cuenta?{' '}
        <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
