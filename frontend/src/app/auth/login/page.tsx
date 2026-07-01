import { LoginForm } from '@/components/LoginForm'
import Link from 'next/link'

/**
 * LoginPage — Página de inicio de sesión con panel decorativo.
 * Ruta: /auth/login
 */

const stats = [
  { num: '320+', label: 'experiencias' },
  { num: '15.000+', label: 'estudiantes' },
  { num: '80+', label: 'empresas' },
]

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-white font-bold text-lg">
            Inspira
          </span>
        </Link>
        <div>
          <h2
            style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
            className="text-4xl font-bold text-white leading-tight mb-4"
          >
            Bienvenido<br />de vuelta
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Conectamos estudiantes secundarios con profesionales y empresas mediante experiencias reales elegidas por interés propio.
          </p>
        </div>
        <div className="flex gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-2xl font-bold text-white">
                {s.num}
              </p>
              <p className="text-indigo-300 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-[#EEEFFE] flex items-center justify-center p-8">
        <LoginForm />
      </div>
    </div>
  )
}
