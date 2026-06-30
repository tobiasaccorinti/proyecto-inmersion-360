'use client'

import Link from 'next/link'
import { useState } from 'react'

/**
 * HomePage — Landing page pública de Inspira.
 * Ruta: /
 */
export default function HomePage() {
  const [statsData] = useState({ experiencias: '320+', estudiantes: '15.000+', empresas: '80+' })
  const [pricingTab, setPricingTab] = useState<'instituciones' | 'empresas'>('instituciones')

  return (
    <div style={{ fontFamily: "var(--font-body, sans-serif)" }} className="min-h-screen bg-[#EEEFFE]">

      {/* TOPBAR */}
      <header className="px-6 md:px-8 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="font-bold text-gray-900 text-lg">Inspira</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#como-funciona" className="text-sm text-gray-500 hover:text-gray-900">Cómo funciona</Link>
          <Link href="#roles" className="text-sm text-gray-500 hover:text-gray-900">Para quién</Link>
          <Link href="#precios" className="text-sm text-gray-500 hover:text-gray-900">Precios</Link>
          <Link href="/auth/login" className="text-sm text-gray-700 font-medium hover:text-gray-900">Iniciar sesión</Link>
          <Link href="/auth/register" className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors">
            Empezar gratis
          </Link>
        </nav>
        {/* Mobile Button */}
        <div className="md:hidden">
            <Link href="/auth/login" className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-bold">Entrar</Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-12 md:pt-20 pb-24">
        <h1
          style={{ fontFamily: "var(--font-heading, sans-serif)" }}
          className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5"
        >
          Conectamos estudiantes<br />
          <span className="text-indigo-600">con el mundo profesional</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Descubrí tu futuro y elegí tu camino. Charlas, talleres y visitas con profesionales reales, elegidos por vos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4 sm:px-0">
          <Link href="/auth/register" className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors text-base text-center">
            Empezar gratis →
          </Link>
          <Link href="/auth/login" className="bg-white text-gray-700 font-semibold px-8 py-4 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base text-center">
            Iniciar sesión
          </Link>
        </div>
        {/* STATS */}
        <div className="inline-flex flex-wrap sm:flex-nowrap gap-6 md:gap-12 bg-white rounded-2xl px-6 md:px-10 py-6 border border-white/80 shadow-sm justify-center">
          {[
            { num: statsData.experiencias, label: 'experiencias' },
            { num: statsData.estudiantes, label: 'estudiantes' },
            { num: statsData.empresas, label: 'empresas aliadas' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-xl md:text-2xl font-bold text-gray-900">{s.num}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-white py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs md:text-sm font-semibold text-indigo-600 uppercase tracking-widest">Cómo funciona</span>
            <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
              Simple para todos los actores
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', who: 'Empresas y profesionales', title: 'Publican experiencias', desc: 'Charlas y talleres con cupos, modalidad y años recomendados. Kits pre-armados para facilitar la preparación.' },
              { num: '02', who: 'Estudiantes', title: 'Eligen por interés', desc: 'Tecnología, salud, diseño, finanzas. El estudiante se inscribe por lo que le apasiona, no por obligación.' },
              { num: '03', who: 'La institución', title: 'Coordina y habilita', desc: 'Valida inscripciones, coordina cupos y hace seguimiento del impacto educativo en su comunidad.' },
            ].map(step => (
              <div key={step.num} className="bg-[#EEEFFE] rounded-2xl p-6 md:p-8">
                <p className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">{step.num} — {step.who}</p>
                <h3 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg md:text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="bg-gray-950 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs md:text-sm font-semibold text-indigo-400 uppercase tracking-widest">Para quién es</span>
            <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl md:text-4xl font-bold text-white mt-3">
              Tres actores, una plataforma
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'ES', title: 'Estudiantes', desc: 'Descubrí áreas que te interesan, inscribite y recibí certificados de participación.' },
              { icon: 'IN', title: 'Instituciones', desc: 'Habilitá experiencias, coordiná cupos y conocé los intereses vocacionales de tus alumnos.' },
              { icon: 'PR', title: 'Profesionales / Empresas', desc: 'Publicá experiencias, usá kits pre-armados y medí el impacto de tu voluntariado.' },
            ].map(role => (
              <div key={role.icon} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-colors">
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

      {/* PRECIOS */}
      <section id="precios" className="bg-[#EEEFFE] py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs md:text-sm font-semibold text-indigo-600 uppercase tracking-widest">Precios</span>
            <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
              Transparente y accesible
            </h2>
            <p className="text-gray-500 mt-3 text-base md:text-lg">El estudiante siempre gratis. Las instituciones y empresas eligen su plan.</p>
          </div>

          {/* Estudiantes banner */}
          <div className="flex items-center justify-center gap-3 bg-white border border-indigo-100 rounded-2xl px-6 py-4 mb-10 max-w-lg mx-auto shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">ES</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Estudiantes — siempre gratis</p>
              <p className="text-xs text-gray-500 mt-0.5">Sin tarjeta de crédito. Sin límites de acceso.</p>
            </div>
            <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">$0</span>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 gap-1">
              <button
                onClick={() => setPricingTab('instituciones')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${pricingTab === 'instituciones' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Instituciones
              </button>
              <button
                onClick={() => setPricingTab('empresas')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${pricingTab === 'empresas' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Empresas
              </button>
            </div>
          </div>

          {/* Cards */}
          {pricingTab === 'instituciones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Free</p>
                <div className="mb-6">
                  <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-extrabold text-gray-900">$0</p>
                  <p className="text-sm text-gray-400 mt-1">Para siempre</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Perfil de institución',
                    'Acceso a todas las experiencias disponibles',
                    'Habilitación de experiencias para alumnos',
                    '30 códigos de registro para estudiantes',
                    'Panel básico de actividad',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="w-full text-center bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors text-sm">
                  Empezar gratis
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-indigo-600 rounded-2xl p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-4 right-4 text-xs font-bold text-indigo-200 bg-white/10 px-3 py-1 rounded-full">Recomendado</div>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-3">Pro</p>
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-extrabold text-white">$29</p>
                    <span className="text-indigo-200 text-sm mb-1.5">/mes</span>
                  </div>
                  <p className="text-sm text-indigo-200 mt-1">Facturado mensualmente</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Todo lo del plan Free',
                    'Códigos ilimitados (solicitud por lotes de 30, 50 o 100)',
                    'Aprobación de lotes por el equipo de Inspira',
                    'Vista completa de alumnos inscriptos',
                    'Estado de cada experiencia habilitada',
                    'Historial de participación por alumno',
                    'Control de asistencia por experiencia',
                    'Reporte de experiencias más elegidas',
                    'Reporte de intereses vocacionales de tu comunidad',
                    'Soporte prioritario',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white">
                      <span className="text-indigo-200 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="w-full text-center bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors text-sm">
                  Empezar con Pro
                </Link>
              </div>
            </div>
          )}

          {pricingTab === 'empresas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Free</p>
                <div className="mb-6">
                  <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-extrabold text-gray-900">$0</p>
                  <p className="text-sm text-gray-400 mt-1">Para siempre</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Perfil de empresa',
                    'Hasta 2 experiencias publicadas por mes',
                    'Gestión básica de cupos',
                    'Conexión con instituciones educativas',
                    'Panel básico de actividad',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="w-full text-center bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors text-sm">
                  Empezar gratis
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-indigo-600 rounded-2xl p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-4 right-4 text-xs font-bold text-indigo-200 bg-white/10 px-3 py-1 rounded-full">Recomendado</div>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-3">Pro</p>
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-4xl font-extrabold text-white">$79</p>
                    <span className="text-indigo-200 text-sm mb-1.5">/mes</span>
                  </div>
                  <p className="text-sm text-indigo-200 mt-1">Facturado mensualmente</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Todo lo del plan Free',
                    'Publicaciones ilimitadas de experiencias',
                    'Gestión avanzada de cupos por experiencia',
                    'Vista de estudiantes inscriptos por actividad',
                    'Feedback directo de los estudiantes',
                    'Estadísticas de participación en tiempo real',
                    'Analytics de instituciones interesadas',
                    'Reportes de asistencia y nivel de satisfacción',
                    'Reportes de impacto descargables',
                    'Mayor visibilidad y posicionamiento en la plataforma',
                    'Posibilidad de destacar experiencias específicas',
                    'Programas educativos patrocinados (Semana de Tecnología, Orientación Vocacional, Experiencias STEM, Charlas de primer empleo)',
                    'Soporte prioritario',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white">
                      <span className="text-indigo-200 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="w-full text-center bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors text-sm">
                  Empezar con Pro
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#EEEFFE] py-16 md:py-24 px-6 text-center">
        <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          ¿Listo para empezar?
        </h2>
        <p className="text-gray-500 mb-8 text-base md:text-lg">Registrate gratis y conectá con el mundo profesional.</p>
        <Link href="/auth/register" className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors text-base">
          Crear cuenta gratis →
        </Link>
      </section>
    </div>
  )
}
