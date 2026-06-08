import Link from 'next/link'

/**
 * HomePage — Landing page pública de Inspira.
 * Ruta: /
 */
export default function HomePage() {
  return (
    <div style={{ fontFamily: "var(--font-body, sans-serif)" }} className="min-h-screen bg-[#EEEFFE]">

      {/* TOPBAR */}
      <header className="px-8 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="font-bold text-gray-900 text-lg">Inspira</span>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="#como-funciona" className="text-sm text-gray-500 hover:text-gray-900">Cómo funciona</Link>
          <Link href="#roles" className="text-sm text-gray-500 hover:text-gray-900">Para quién</Link>
          <Link href="/auth/login" className="text-sm text-gray-700 font-medium hover:text-gray-900">Iniciar sesión</Link>
          <Link href="/auth/register" className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors">
            Empezar gratis
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-24">
        <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span className="text-sm text-gray-600 font-medium">Conectamos estudiantes con el mundo profesional</span>
        </div>
        <h1
          style={{ fontFamily: "var(--font-heading, sans-serif)" }}
          className="text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6"
        >
          Descubrí tu futuro,<br />
          <span className="text-indigo-600">elegí tu camino</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Inspira conecta estudiantes secundarios con charlas y talleres de profesionales reales, elegidos por interés propio.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Link href="/auth/register" className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors text-base">
            Empezar gratis →
          </Link>
          <Link href="/auth/login" className="bg-white text-gray-700 font-semibold px-8 py-4 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base">
            Iniciar sesión
          </Link>
        </div>
        {/* STATS */}
        <div className="inline-flex gap-12 bg-white rounded-2xl px-10 py-6 border border-white/80 shadow-sm">
          {[
            { num: '120+', label: 'experiencias' },
            { num: '4.500', label: 'estudiantes' },
            { num: '25', label: 'empresas aliadas' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{s.num}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">Cómo funciona</span>
            <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-bold text-gray-900 mt-3">
              Simple para todos los actores
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { num: '01', who: 'Empresas y profesionales', title: 'Publican experiencias', desc: 'Charlas y talleres con cupos, modalidad y años recomendados. Kits pre-armados para facilitar la preparación.' },
              { num: '02', who: 'Estudiantes', title: 'Eligen por interés', desc: 'Tecnología, salud, diseño, finanzas. El estudiante se inscribe por lo que le apasiona, no por obligación.' },
              { num: '03', who: 'La institución', title: 'Coordina y habilita', desc: 'Valida inscripciones, coordina cupos y hace seguimiento del impacto educativo en su comunidad.' },
            ].map(step => (
              <div key={step.num} className="bg-[#EEEFFE] rounded-2xl p-8">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">{step.num} — {step.who}</p>
                <h3 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="bg-gray-950 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Para quién es</span>
            <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-bold text-white mt-3">
              Tres actores, una plataforma
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: 'ES', title: 'Estudiantes', desc: 'Descubrí áreas que te interesan, inscribite y recibí certificados de participación.' },
              { icon: 'IN', title: 'Instituciones', desc: 'Habilitá experiencias, coordiná cupos y conocé los intereses vocacionales de tus alumnos.' },
              { icon: 'PR', title: 'Profesionales / Empresas', desc: 'Publicá experiencias, usá kits pre-armados y medí el impacto de tu voluntariado.' },
            ].map(role => (
              <div key={role.icon} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-sm font-bold mb-5">
                  {role.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-white font-bold text-lg mb-2">{role.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#EEEFFE] py-24 px-6 text-center">
        <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-bold text-gray-900 mb-4">
          ¿Listo para empezar?
        </h2>
        <p className="text-gray-500 mb-8 text-lg">Registrate gratis y conectá con el mundo profesional.</p>
        <Link href="/auth/register" className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors text-base">
          Crear cuenta gratis →
        </Link>
      </section>
    </div>
  )
}
