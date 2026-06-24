'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const AREA_EMOJI: Record<string, string> = {
  'Tecnología': '💻', 'Salud': '🏥', 'Diseño': '🎨',
  'Finanzas': '💰', 'Oficios': '🔧', 'Marketing': '📣',
  'Derecho': '⚖️', 'Ambiente': '🌿',
}

const AREA_GRADIENT: Record<string, string> = {
  'Tecnología': 'from-blue-100 to-blue-50',
  'Salud': 'from-green-100 to-green-50',
  'Diseño': 'from-pink-100 to-pink-50',
  'Finanzas': 'from-yellow-100 to-yellow-50',
  'Oficios': 'from-orange-100 to-orange-50',
  'Marketing': 'from-purple-100 to-purple-50',
  'Derecho': 'from-red-100 to-red-50',
  'Ambiente': 'from-teal-100 to-teal-50',
}

const AREA_BADGE: Record<string, string> = {
  'Tecnología': 'bg-blue-50 text-blue-600',
  'Salud': 'bg-green-50 text-green-600',
  'Diseño': 'bg-pink-50 text-pink-600',
  'Finanzas': 'bg-yellow-50 text-yellow-600',
  'Oficios': 'bg-orange-50 text-orange-600',
  'Marketing': 'bg-purple-50 text-purple-600',
  'Derecho': 'bg-red-50 text-red-600',
  'Ambiente': 'bg-teal-50 text-teal-600',
}

export default function DashboardEstudiante() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [experienciasDisponibles, setExperienciasDisponibles] = useState<any[]>([])
  const [inscripciones, setInscripciones] = useState<any[]>([])
  const [experienciaSeleccionada, setExperienciaSeleccionada] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [inscribiendo, setInscribiendo] = useState(false)
  const [mesCalendario, setMesCalendario] = useState(new Date())
  const [filtroArea, setFiltroArea] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof) setProfile(prof)

      if (prof?.institucion_id) {
        await loadExperiencias(prof.institucion_id)
      }

      await loadInscripciones(user.id)
      setLoading(false)
    }
    load()
  }, [])

  async function loadExperiencias(institucionId: string) {
    // Traer experiencias habilitadas por la institución del alumno
    const { data: habilitadas } = await supabase
      .from('experiencia_instituciones')
      .select('experiencia_id, cupos_reservados')
      .eq('institucion_id', institucionId)

    if (!habilitadas || habilitadas.length === 0) {
      setExperienciasDisponibles([])
      return
    }

    const ids = habilitadas.map(h => h.experiencia_id)

    const { data: exps } = await supabase
      .from('experiencias')
      .select('*')
      .in('id', ids)
      .order('fecha', { ascending: true })

    if (exps) setExperienciasDisponibles(exps)
  }

  async function loadInscripciones(userId: string) {
    const { data } = await supabase
      .from('inscripciones')
      .select('*, experiencias(*)')
      .eq('estudiante_id', userId)
      .order('created_at', { ascending: false })
    if (data) setInscripciones(data)
  }

  async function handleInscribirse(experienciaId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setInscribiendo(true)

    const { error } = await supabase
      .from('inscripciones')
      .insert({ estudiante_id: user.id, experiencia_id: experienciaId })

    if (!error) {
      await loadInscripciones(user.id)
      setExperienciaSeleccionada(null)
    }

    setInscribiendo(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEEFFE] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'estudiante'

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: '⊞' },
    { id: 'explorar', label: 'Explorar', icon: '◎' },
    { id: 'inscripciones', label: 'Mis inscripciones', icon: '✓' },
    { id: 'calendario', label: 'Calendario', icon: '▦' },
  ]

  const inscripcionIds = new Set(inscripciones.map(i => i.experiencia_id))

  const experienciasFiltradas = experienciasDisponibles
    .filter(e => !filtroArea || e.area === filtroArea)

  // Próximas charlas inscriptas
  const proximasInscriptas = inscripciones
    .map(i => i.experiencias)
    .filter(e => e && new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // Calendario
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const año = mesCalendario.getFullYear()
  const mes = mesCalendario.getMonth()
  const primerDia = new Date(año, mes, 1).getDay()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const offsetInicio = primerDia === 0 ? 6 : primerDia - 1
  const nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const hoy = new Date()
  const esHoy = (dia: number) => dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear()

  const diasConCharlas = new Set(
    proximasInscriptas
      .filter(e => {
        const f = new Date(e.fecha)
        return f.getFullYear() === año && f.getMonth() === mes
      })
      .map(e => new Date(e.fecha).getDate())
  )

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex" style={{ fontFamily: "var(--font-body, sans-serif)" }}>

      {/* MODAL DETALLES */}
      {experienciaSeleccionada && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className={`h-40 flex items-center justify-center relative bg-gradient-to-br ${AREA_GRADIENT[experienciaSeleccionada.area] || 'from-indigo-100 to-indigo-50'}`}>
              <span className="text-6xl">{AREA_EMOJI[experienciaSeleccionada.area] || '📚'}</span>
              <button
                onClick={() => setExperienciaSeleccionada(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-sm"
              >✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${AREA_BADGE[experienciaSeleccionada.area] || 'bg-gray-50 text-gray-600'}`}>
                  {experienciaSeleccionada.area}
                </span>
                <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-xl font-bold text-gray-900 mt-3 mb-1">
                  {experienciaSeleccionada.titulo}
                </h2>
                <p className="text-sm text-gray-500">{experienciaSeleccionada.empresa}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Modalidad', value: experienciaSeleccionada.modalidad },
                  { label: 'Duración', value: `${experienciaSeleccionada.duracion_minutos} min` },
                  { label: 'Fecha', value: new Date(experienciaSeleccionada.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Años recomendados', value: experienciaSeleccionada.anios_recomendados },
                ].map(item => (
                  <div key={item.label} className="bg-[#EEEFFE] rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{item.value}</p>
                  </div>
                ))}
              </div>

              {experienciaSeleccionada.descripcion && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Descripción</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{experienciaSeleccionada.descripcion}</p>
                </div>
              )}

              {experienciaSeleccionada.url_grabacion && (
                <div className="mb-4">
                  <a href={experienciaSeleccionada.url_grabacion} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-indigo-600 font-medium hover:underline">
                    Ver grabación →
                  </a>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setExperienciaSeleccionada(null)}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm py-2.5 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                {inscripcionIds.has(experienciaSeleccionada.id) ? (
                  <span className="flex-1 bg-green-50 text-green-600 font-medium text-sm py-2.5 rounded-full text-center">
                    ✓ Ya inscripto
                  </span>
                ) : (
                  <button
                    onClick={() => handleInscribirse(experienciaSeleccionada.id)}
                    disabled={inscribiendo}
                    className="flex-1 bg-indigo-600 text-white font-semibold text-sm py-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {inscribiendo ? 'Inscribiendo...' : 'Inscribirme →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-56 bg-white flex flex-col py-6 px-4 gap-6 min-h-screen border-r border-gray-100 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="font-bold text-gray-900">Inspira</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                activeNav === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 pt-4 px-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-400">Estudiante</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-xs text-gray-400 hover:text-gray-600 text-left px-1">
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* BIENVENIDA */}
        <div className="bg-indigo-600 rounded-2xl p-8 mb-6 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm mb-1">Bienvenido de vuelta</p>
            <h1 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl font-bold text-white">
              Hola, {firstName} 👋
            </h1>
            <p className="text-indigo-200 mt-2 text-sm">Explorá experiencias y conectá con el mundo profesional.</p>
          </div>
          <button
            onClick={() => setActiveNav('explorar')}
            className="bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors flex-shrink-0"
          >
            Explorar experiencias →
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{experienciasDisponibles.length}</p>
            <p className="text-sm text-gray-400 mt-0.5">Experiencias disponibles</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{inscripciones.length}</p>
            <p className="text-sm text-gray-400 mt-0.5">Inscripciones activas</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{proximasInscriptas.length}</p>
            <p className="text-sm text-gray-400 mt-0.5">Próximas charlas</p>
          </div>
        </div>

        {/* INICIO */}
        {activeNav === 'dashboard' && (
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-6">
              {/* Próximas charlas */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-base font-bold text-gray-900">Mis próximas charlas</h2>
                  <button onClick={() => setActiveNav('inscripciones')} className="text-xs text-indigo-600 font-medium hover:underline">Ver todas →</button>
                </div>
                <div>
                  {proximasInscriptas.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-sm">No tenés charlas próximas.</p>
                      <button onClick={() => setActiveNav('explorar')} className="mt-3 text-xs text-indigo-600 font-medium hover:underline">
                        Explorar experiencias →
                      </button>
                    </div>
                  ) : (
                    proximasInscriptas.slice(0, 4).map(exp => (
                      <div key={exp.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-br ${AREA_GRADIENT[exp.area] || 'from-indigo-100 to-indigo-50'}`}>
                          {AREA_EMOJI[exp.area] || '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{exp.titulo}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{exp.empresa} · {exp.modalidad}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold text-indigo-600">
                            {new Date(exp.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(exp.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Experiencias recomendadas */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-base font-bold text-gray-900">Disponibles para vos</h2>
                  <button onClick={() => setActiveNav('explorar')} className="text-xs text-indigo-600 font-medium hover:underline">Ver todas →</button>
                </div>
                <div>
                  {experienciasDisponibles.filter(e => !inscripcionIds.has(e.id)).length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-sm">Ya estás inscripto en todas las experiencias disponibles.</p>
                    </div>
                  ) : (
                    experienciasDisponibles
                      .filter(e => !inscripcionIds.has(e.id))
                      .slice(0, 3)
                      .map(exp => (
                        <div key={exp.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setExperienciaSeleccionada(exp)}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-br ${AREA_GRADIENT[exp.area] || 'from-indigo-100 to-indigo-50'}`}>
                            {AREA_EMOJI[exp.area] || '📚'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{exp.titulo}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{exp.empresa} · {exp.modalidad}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AREA_BADGE[exp.area] || 'bg-gray-50 text-gray-600'}`}>
                            {exp.area}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* CALENDARIO */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-base font-bold text-gray-900">
                    {nombresMeses[mes]} {año}
                  </h2>
                  <div className="flex gap-1">
                    <button onClick={() => setMesCalendario(new Date(año, mes - 1, 1))}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center text-sm">‹</button>
                    <button onClick={() => setMesCalendario(new Date(año, mes + 1, 1))}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center text-sm">›</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {diasSemana.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: offsetInicio }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => (
                    <div key={dia} className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium relative ${
                      esHoy(dia) ? 'bg-indigo-600 text-white' :
                      diasConCharlas.has(dia) ? 'bg-indigo-100 text-indigo-700 font-bold' :
                      'text-gray-600 hover:bg-gray-100'
                    }`}>
                      {dia}
                      {diasConCharlas.has(dia) && !esHoy(dia) && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Este mes</p>
                  {proximasInscriptas
                    .filter(e => { const f = new Date(e.fecha); return f.getFullYear() === año && f.getMonth() === mes })
                    .slice(0, 3)
                    .map(exp => (
                      <div key={exp.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <p className="text-xs text-gray-600 truncate">{exp.titulo}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">{new Date(exp.fecha).getDate()}</span>
                      </div>
                    ))}
                  {proximasInscriptas.filter(e => { const f = new Date(e.fecha); return f.getFullYear() === año && f.getMonth() === mes }).length === 0 && (
                    <p className="text-xs text-gray-400">Sin charlas este mes</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPLORAR */}
        {activeNav === 'explorar' && (
          <div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 flex gap-3 flex-wrap items-center">
              <select
                className="bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                value={filtroArea}
                onChange={e => setFiltroArea(e.target.value)}
              >
                <option value="">Todas las áreas</option>
                {['Tecnología','Salud','Diseño','Finanzas','Oficios','Marketing','Derecho','Ambiente'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button onClick={() => setFiltroArea('')} className="text-sm text-indigo-600 font-medium hover:underline">
                Limpiar
              </button>
              <span className="ml-auto text-sm text-gray-400">{experienciasFiltradas.length} experiencias</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {experienciasFiltradas.length === 0 ? (
                <div className="col-span-3 bg-white rounded-2xl p-12 border border-gray-100 text-center">
                  <p className="text-gray-400 text-sm">Tu institución todavía no habilitó experiencias.</p>
                </div>
              ) : (
                experienciasFiltradas.map(exp => {
                  const inscripto = inscripcionIds.has(exp.id)
                  return (
                    <div key={exp.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all flex flex-col">
                      <div className={`h-32 flex items-center justify-center bg-gradient-to-br ${AREA_GRADIENT[exp.area] || 'from-indigo-100 to-indigo-50'}`}>
                        <span className="text-5xl">{AREA_EMOJI[exp.area] || '📚'}</span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AREA_BADGE[exp.area] || 'bg-gray-50 text-gray-600'}`}>
                            {exp.area}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">{exp.modalidad}</span>
                        </div>
                        <h3 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">
                          {exp.titulo}
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">{exp.empresa}</p>
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-xs mb-3">
                            <span className="text-gray-400">📅 {new Date(exp.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                            {inscripto && <span className="bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">✓ Inscripto</span>}
                          </div>
                          <button
                            onClick={() => setExperienciaSeleccionada(exp)}
                            className="w-full text-sm border border-gray-200 text-gray-700 font-medium py-2 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* MIS INSCRIPCIONES */}
        {activeNav === 'inscripciones' && (
          <div>
            {inscripciones.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                <p className="text-gray-400 text-sm mb-3">Todavía no te inscribiste en ninguna experiencia.</p>
                <button
                  onClick={() => setActiveNav('explorar')}
                  className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Explorar experiencias →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {inscripciones.map(insc => {
                  const exp = insc.experiencias
                  if (!exp) return null
                  const pasada = new Date(exp.fecha) < new Date()
                  return (
                    <div key={insc.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 hover:border-indigo-200 transition-all">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br ${AREA_GRADIENT[exp.area] || 'from-indigo-100 to-indigo-50'}`}>
                        {AREA_EMOJI[exp.area] || '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{exp.titulo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {exp.empresa} · {exp.modalidad} · {new Date(exp.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pasada ? (
                          <span className="text-xs bg-gray-100 text-gray-500 font-medium px-3 py-1.5 rounded-full">Finalizada</span>
                        ) : (
                          <span className="text-xs bg-green-50 text-green-600 font-medium px-3 py-1.5 rounded-full">✓ Confirmada</span>
                        )}
                        {exp.url_grabacion && (
                          <a href={exp.url_grabacion} target="_blank" rel="noopener noreferrer"
                            className="text-xs bg-indigo-50 text-indigo-600 font-medium px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                            Ver grabación →
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* CALENDARIO */}
        {activeNav === 'calendario' && (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg font-bold text-gray-900">
                    {nombresMeses[mes]} {año}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => setMesCalendario(new Date(año, mes - 1, 1))}
                      className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors">‹</button>
                    <button onClick={() => setMesCalendario(new Date(año, mes + 1, 1))}
                      className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors">›</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {diasSemana.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {Array.from({ length: offsetInicio }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => (
                    <div key={dia} className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium relative ${
                      esHoy(dia) ? 'bg-indigo-600 text-white' :
                      diasConCharlas.has(dia) ? 'bg-indigo-100 text-indigo-700 font-bold' :
                      'text-gray-600 hover:bg-gray-100'
                    }`}>
                      {dia}
                      {diasConCharlas.has(dia) && !esHoy(dia) && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-72 flex-shrink-0 flex flex-col gap-3">
              <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-base font-bold text-gray-900">
                Charlas de {nombresMeses[mes]}
              </h2>
              {proximasInscriptas
                .filter(e => { const f = new Date(e.fecha); return f.getFullYear() === año && f.getMonth() === mes })
                .length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                  <p className="text-gray-400 text-sm">Sin charlas este mes.</p>
                </div>
              ) : (
                proximasInscriptas
                  .filter(e => { const f = new Date(e.fecha); return f.getFullYear() === año && f.getMonth() === mes })
                  .map(exp => (
                    <div key={exp.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-br ${AREA_GRADIENT[exp.area] || 'from-indigo-100 to-indigo-50'}`}>
                          {AREA_EMOJI[exp.area] || '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{exp.titulo}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(exp.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} · {new Date(exp.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}