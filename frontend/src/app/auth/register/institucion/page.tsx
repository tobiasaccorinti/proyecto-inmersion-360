import { RegisterInstitucionForm } from '@/components/RegisterInstitucionForm'
import Link from 'next/link'

export default function RegisterInstitucionPage() {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex w-1/2 bg-indigo-900 flex-col justify-between p-12">
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
            Empoderá a tus alumnos<br />con el mundo real
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Unite a la red de instituciones que conectan la educación secundaria
            con el futuro profesional.
          </p>
        </div>
        <div className="text-indigo-300 text-sm">
          © 2026 Inspira - Programa de Orientación Vocacional
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <RegisterInstitucionForm />
      </div>
    </div>
  )
}
