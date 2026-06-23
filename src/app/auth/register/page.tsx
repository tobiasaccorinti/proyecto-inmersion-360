'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Role = 'estudiante' | 'institucion' | 'empresa'
type Step = 'role' | 'datos'

function generarPrefijo(nombre: string): string {
  return nombre
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .join('')
    .slice(0, 6)
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<Role>('estudiante')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [codigoAlumno, setCodigoAlumno] = useState('')
  const [nombreInstitucion, setNombreInstitucion] = useState('')
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setLoading(true)
    setError('')

    // 1. Crear usuario en Supabase Auth
    // Validar código ANTES de crear el usuario
if (role === 'estudiante') {
  const { data: codigoCheck, error: codigoCheckError } = await supabase
    .from('codigos_alumno')
    .select('id, usado, institucion_id, email_alumno')
    .eq('codigo', codigoAlumno.trim().toUpperCase())
    .single()

  if (codigoCheckError || !codigoCheck) {
    setError('El código ingresado no existe. Verificá con tu institución.')
    setLoading(false)
    return
  }

  if (codigoCheck.usado) {
    setError('Este código ya fue utilizado.')
    setLoading(false)
    return
  }

  if (codigoCheck.email_alumno && codigoCheck.email_alumno !== email) {
    setError('El código no corresponde a tu email. Verificá con tu institución.')
    setLoading(false)
    return
  }
}

const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
if (signUpError || !data.user) {
  setError(signUpError?.message || 'Error al registrarse')
  setLoading(false)
  return
}

const userId = data.user.id

    // 2. Flujo según rol
    if (role === 'estudiante') {
      // Validar código
      const { data: codigo, error: codigoError } = await supabase
        .from('codigos_alumno')
        .select('id, usado, institucion_id, email_alumno')
        .eq('codigo', codigoAlumno.trim().toUpperCase())
        .single()

    if (!codigoError && codigo && codigo.email_alumno && codigo.email_alumno !== email) {
        setError('El código no corresponde a tu email. Verificá con tu institución.')
        setLoading(false)
        return
}

      if (codigoError || !codigo) {
        setError('El código ingresado no existe. Verificá con tu institución.')
        setLoading(false)
        return
      }

      if (codigo.usado) {
        setError('Este código ya fue utilizado.')
        setLoading(false)
        return
      }

      // Crear perfil con institucion_id
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, role, full_name: fullName, institucion_id: codigo.institucion_id })

      if (profileError) { setError(profileError.message); setLoading(false); return }

      // Marcar código como usado
      await supabase
        .from('codigos_alumno')
        .update({ usado: true, alumno_id: userId })
        .eq('id', codigo.id)

    } else if (role === 'institucion') {
      const prefijo = generarPrefijo(nombreInstitucion)

      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, role, full_name: fullName })

      if (profileError) { setError(profileError.message); setLoading(false); return }

      // Crear institución
      const { error: instError } = await supabase
        .from('instituciones')
        .insert({ nombre: nombreInstitucion, prefijo, creado_por: userId })

      if (instError) { setError(instError.message); setLoading(false); return }

    } else {
      // Empresa
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, role, full_name: nombreEmpresa })

      if (profileError) { setError(profileError.message); setLoading(false); return }
    }

    router.push('/dashboard')
  }

  const roles = [
    { value: 'estudiante' as Role, label: 'Estudiante', desc: 'Explorá experiencias por interés', icon: '🎓' },
    { value: 'institucion' as Role, label: 'Institución', desc: 'Coordiná experiencias para tus alumnos', icon: '🏫' },
    { value: 'empresa' as Role, label: 'Empresa / Profesional', desc: 'Publicá charlas y medí tu impacto', icon: '🏢' },
  ]

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
            Descubrí tu futuro,<br />elegí tu camino
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Conectamos estudiantes secundarios con profesionales y empresas mediante experiencias reales elegidas por interés propio.
          </p>
        </div>
        <div className="flex gap-8">
          {[{ num: '120+', label: 'experiencias' }, { num: '4.500', label: 'estudiantes' }, { num: '25', label: 'empresas' }].map(s => (
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

          {/* STEP 1 — ELEGIR ROL */}
          {step === 'role' && (
            <>
              <div className="mb-8">
                <h1 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl font-bold text-gray-900 mb-2">
                  Crear cuenta
                </h1>
                <p className="text-gray-500">¿Cómo vas a usar Inspira?</p>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {roles.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      role === r.value
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                        : 'border-gray-200 bg-white hover:border-indigo-200'
                    }`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${role === r.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-gray-400">{r.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ml-auto flex-shrink-0 ${
                      role === r.value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                    }`} />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('datos')}
                className="w-full bg-indigo-600 text-white rounded-full py-3.5 text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Continuar →
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                ¿Ya tenés cuenta?{' '}
                <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
                  Iniciá sesión
                </Link>
              </p>
            </>
          )}

          {/* STEP 2 — DATOS */}
          {step === 'datos' && (
            <>
              <div className="mb-8">
                <button onClick={() => setStep('role')} className="text-sm text-indigo-600 font-medium mb-4 hover:underline flex items-center gap-1">
                  ← Volver
                </button>
                <h1 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl font-bold text-gray-900 mb-2">
                  {role === 'estudiante' ? 'Datos del estudiante' : role === 'institucion' ? 'Datos de la institución' : 'Datos de la empresa'}
                </h1>
                <p className="text-gray-500">Completá tu información para continuar</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">

                {/* Campos comunes */}
                {(role === 'estudiante' || role === 'institucion') && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nombre completo</label>
                    <input
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                )}

                {/* Campo específico institución */}
                {role === 'institucion' && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nombre de la institución</label>
                    <input
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                      value={nombreInstitucion}
                      onChange={e => setNombreInstitucion(e.target.value)}
                      placeholder="Ej: Instituto Santísima Virgen Niña"
                    />
                    {nombreInstitucion && (
                      <p className="text-xs text-indigo-600 font-medium mt-1.5">
                        Prefijo generado: <strong>{generarPrefijo(nombreInstitucion)}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Campo específico empresa */}
                {role === 'empresa' && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nombre de la empresa o profesional</label>
                    <input
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                      value={nombreEmpresa}
                      onChange={e => setNombreEmpresa(e.target.value)}
                      placeholder="Ej: Mercado Libre"
                    />
                  </div>
                )}

                {/* Campo código alumno */}
                {role === 'estudiante' && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Código de tu institución</label>
                    <input
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400 uppercase"
                      value={codigoAlumno}
                      onChange={e => setCodigoAlumno(e.target.value)}
                      placeholder="Ej: ISVN-X7K2-9M4P"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Tu institución te provee este código</p>
                  </div>
                )}

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
                      placeholder="Mínimo 6 caracteres"
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
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white rounded-full py-3.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  ¿Ya tenés cuenta?{' '}
                  <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
                    Iniciá sesión
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}