import { RegisterEmpresaForm } from '@/components/RegisterEmpresaForm'
import Link from 'next/link'

export default function RegisterEmpresaPage() {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex w-1/2 bg-teal-800 flex-col justify-between p-12">
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
            Inspirá a los futuros<br />profesionales
          </h2>
          <p className="text-teal-100 text-lg leading-relaxed">
            Publicá charlas, ofrecé talleres y mostrá el Valor de tu trabajo
            a miles de estudiantes.
          </p>
        </div>
        <div className="text-teal-200 text-sm">
          © 2026 Inspira - Programa de Orientación Vocacional
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <RegisterEmpresaForm />
      </div>
    </div>
  )
}
