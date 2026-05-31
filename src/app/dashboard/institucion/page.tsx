'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Institucion = { id: string; nombre: string; prefijo: string; codigos_generados: number }
type Codigo = { id: string; codigo: string; usado: boolean; alumno_id: string | null; nombre_alumno: string | null; email_alumno: string | null }
type Alumno = { id: string; nombre: string; email: string; codigo_id: string | null; codigos_alumno: { codigo: string } | null }

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

function generarCodigoAleatorio(prefijo: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${prefijo}-${random(4)}-${random(4)}`
}

export default function DashboardInstitucion() {
  const router = useRouter()
  const supabase = createClient()

  const [institucion, setInstitucion] = useState<Institucion | null>(null)
  const [codigos, setCodigos] = useState<Codigo[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [experienciasDisponibles, setExperienciasDisponibles] = useState<any[]>([])
  const [experienciasHabilitadas, setExperienciasHabilitadas] = useState<any[]>([])
  const [todasLasHabilitaciones, setTodasLasHabilitaciones] = useState<any[]>([])
  const [experienciaSeleccionada, setExperienciaSeleccionada] = useState<any | null>(null)
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [cantidad, setCantidad] = useState(10)
  const [generando, setGenerando] = useState(false)
  const [cuposModal, setCuposModal] = useState(10)
  const [mesCalendario, setMesCalendario] = useState(new Date())

  const [nombreAlumno, setNombreAlumno] = useState('')
  const [emailAlumno, setEmailAlumno] = useState('')
  const [agregando, setAgregando] = useState(false)
  const [errorAlumno, setErrorAlumno] = useState('')
  const [successAlumno, setSuccessAlumno] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: inst } = await supabase
        .from('instituciones')
        .select('*')
        .eq('creado_por', user.id)
        .single()

      if (inst) {
        setInstitucion(inst)
        await loadCodigos(inst.id)
        await loadAlumnos(inst.id)
        await loadExperienciasHabilitadas(inst.id)
      }

      await loadExperiencias()
      await loadTodasLasHabilitaciones()
      setLoading(false)
    }
    load()
  }, [])

  async function loadCodigos(instId: string) {
    const { data } = await supabase
      .from('codigos_alumno')
      .select('*')
      .eq('institucion_id', instId)
      .order('created_at', { ascending: false })
    if (data) setCodigos(data)
  }

  async function loadAlumnos(instId: string) {
    const { data } = await supabase
      .from('alumnos_institucion')
      .select('*, codigos_alumno(codigo)')
      .eq('institucion_id', instId)
      .order('created_at', { ascending: false })
    if (data) setAlumnos(data as Alumno[])
  }

  async function loadExperiencias() {
    const { data } = await supabase
      .from('experiencias')
      .select('*')
      .order('fecha', { ascending: true })
    if (data) setExperienciasDisponibles(data)
  }

  async function loadExperienciasHabilitadas(instId: string) {
    const { data } = await supabase
      .from('experiencia_instituciones')
      .select('*')
      .eq('institucion_id', instId)
    if (data) setExperienciasHabilitadas(data)
  }

  async function loadTodasLasHabilitaciones() {
    const { data } = await supabase
      .from('experiencia_instituciones')
      .select('*')
    if (data) setTodasLasHabilitaciones(data)
  }

  async function handleHabilitarExperiencia(experienciaId: string, cupos: number) {
    if (!institucion) return
    const { error } = await supabase
      .from('experiencia_instituciones')
      .insert({
        experiencia_id: experienciaId,
        institucion_id: institucion.id,
        cupos_reservados: cupos,
      })
    if (!error) {
      await loadExperienciasHabilitadas(institucion.id)
      await loadTodasLasHabilitaciones()
      setExperienciaSeleccionada(null)
    }
  }

  async function handleGenerarCodigos() {
    if (!institucion) return
    setGenerando(true)

    const nuevosCodigos = Array.from({ length: cantidad }, () => ({
      codigo: generarCodigoAleatorio(institucion.prefijo),
      institucion_id: institucion.id,
      usado: false,
    }))

    const { data, error } = await supabase
      .from('codigos_alumno')
      .insert(nuevosCodigos)
      .select()

    if (!error && data) {
      setCodigos(prev => [...data, ...prev])
      await supabase
        .from('instituciones')
        .update({ codigos_generados: institucion.codigos_generados + cantidad })
        .eq('id', institucion.id)
      setInstitucion(prev => prev ? { ...prev, codigos_generados: prev.codigos_generados + cantidad } : prev)
    }

    setGenerando(false)
  }

  async function handleAgregarAlumno() {
    if (!institucion || !nombreAlumno || !emailAlumno) return
    setAgregando(true)
    setErrorAlumno('')
    setSuccessAlumno('')

    const codigoDisponible = codigos.find(c => !c.usado && !c.email_alumno)

    if (!codigoDisponible) {
      setErrorAlumno('No hay códigos disponibles. Generá más códigos primero.')
      setAgregando(false)
      return
    }

    const { error: alumnoError } = await supabase
      .from('alumnos_institucion')
      .insert({
        institucion_id: institucion.id,
        nombre: nombreAlumno,
        email: emailAlumno,
        codigo_id: codigoDisponible.id,
      })

    if (alumnoError) {
      setErrorAlumno(alumnoError.message.includes('unique') ? 'Ya existe un alumno con ese email.' : alumnoError.message)
      setAgregando(false)
      return
    }

    await supabase
      .from('codigos_alumno')
      .update({ nombre_alumno: nombreAlumno, email_alumno: emailAlumno })
      .eq('id', codigoDisponible.id)

    setSuccessAlumno(`Código ${codigoDisponible.codigo} asignado a ${nombreAlumno}`)
    setNombreAlumno('')
    setEmailAlumno('')
    await loadAlumnos(institucion.id)
    await loadCodigos(institucion.id)
    setAgregando(false)
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'experiencias', label: 'Experiencias', icon: '◎' },
    { id: 'alumnos', label: 'Mis alumnos', icon: '◉' },
    { id: 'codigos', label: 'Códigos', icon: '⊕' },
  ]

  const codigosUsados = codigos.filter(c => c.usado).length

  const experienciasFiltradas = experienciasDisponibles
    .filter(e => e.estado === 'publicada')
    .filter(e => (!filtroArea || e.area === filtroArea) && (!filtroModalidad || e.modalidad === filtroModalidad))

  const getCuposDisponibles = (expId: string, cuposTotales: number) => {
    const reservados = todasLasHabilitaciones
      .filter(h => h.experiencia_id === expId)
      .reduce((acc: number, h: any) => acc + h.cupos_reservados, 0)
    return Math.max(0, cuposTotales - reservados)
  }

  const cuposDisponiblesModal = experienciaSeleccionada
    ? getCuposDisponibles(experienciaSeleccionada.id, experienciaSeleccionada.cupos_totales)
    : 0

  // Experiencias habilitadas con datos completos
  const proximasCharlas = experienciasHabilitadas
    .map(h => experienciasDisponibles.find(e => e.id === h.experiencia_id))
    .filter(Boolean)
    .filter(e => new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // Actividad reciente
  const actividadReciente = [
    ...alumnos.slice(0, 3).map(a => ({
      tipo: 'alumno',
      texto: `${a.nombre} se registró`,
      icono: '👤',
      color: 'bg-indigo-50 text-indigo-600',
    })),
    ...experienciasHabilitadas.slice(0, 3).map(h => {
      const exp = experienciasDisponibles.find(e => e.id === h.experiencia_id)
      return {
        tipo: 'experiencia',
        texto: exp ? `"${exp.titulo}" habilitada` : 'Experiencia habilitada',
        icono: '✓',
        color: 'bg-green-50 text-green-600',
      }
    }),
  ].slice(0, 5)

  // Calendario
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const año = mesCalendario.getFullYear()
  const mes = mesCalendario.getMonth()
  const primerDia = new Date(año, mes, 1).getDay()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const offsetInicio = primerDia === 0 ? 6 : primerDia - 1

  const diasConCharlas = new Set(
    proximasCharlas
      .filter(e => {
        const f = new Date(e.fecha)
        return f.getFullYear() === año && f.getMonth() === mes
      })
      .map(e => new Date(e.fecha).getDate())
  )

  const hoy = new Date()
  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear()

  const nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

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
              >
                ✕
              </button>
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
                  { label: 'Cupos totales', value: experienciaSeleccionada.cupos_totales },
                  { label: 'Cupos disponibles', value: cuposDisponiblesModal },
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
                {experienciasHabilitadas.find(h => h.experiencia_id === experienciaSeleccionada.id) ? (
                  <span className="flex-1 bg-green-50 text-green-600 font-medium text-sm py-2.5 rounded-full text-center">
                    ✓ Ya habilitada
                  </span>
                ) : cuposDisponiblesModal > 0 ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={cuposDisponiblesModal}
                      value={cuposModal}
                      onChange={e => {
                        const val = Number(e.target.value)
                        setCuposModal(val > cuposDisponiblesModal ? cuposDisponiblesModal : val)
                      }}
                      className="w-20 bg-[#EEEFFE] border border-gray-200 rounded-full px-3 text-sm text-gray-900 outline-none focus:border-indigo-400 text-center"
                    />
                    <button
                      onClick={() => {
                        if (cuposModal > cuposDisponiblesModal || cuposModal < 1) {
                          alert(`Ingresá un número entre 1 y ${cuposDisponiblesModal}.`)
                          return
                        }
                        handleHabilitarExperiencia(experienciaSeleccionada.id, cuposModal)
                      }}
                      className="flex-1 bg-indigo-600 text-white font-semibold text-sm py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
                    >
                      Habilitar →
                    </button>
                  </div>
                ) : (
                  <span className="flex-1 bg-red-50 text-red-500 font-medium text-sm py-2.5 rounded-full text-center">
                    Sin cupos disponibles
                  </span>
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
              {institucion?.nombre?.charAt(0).toUpperCase() || 'I'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{institucion?.nombre}</p>
              <p className="text-xs text-gray-400">Prefijo: {institucion?.prefijo}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-xs text-gray-400 hover:text-gray-600 text-left px-1">
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-8 overflow-y-auto">

        <div className="bg-indigo-600 rounded-2xl p-8 mb-6">
          <p className="text-indigo-200 text-sm mb-1">Panel de institución</p>
          <h1 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl font-bold text-white">
            {institucion?.nombre} 🏫
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">Gestioná tus alumnos y habilitá experiencias para tu institución.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{alumnos.length}</p>
            <p className="text-sm text-gray-400 mt-0.5">Alumnos cargados</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{codigosUsados}</p>
            <p className="text-sm text-gray-400 mt-0.5">Alumnos registrados</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{experienciasHabilitadas.length}</p>
            <p className="text-sm text-gray-400 mt-0.5">Experiencias habilitadas</p>
          </div>
        </div>

        {/* DASHBOARD */}
        {activeNav === 'dashboard' && (
          <div className="flex gap-6">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex-1 flex flex-col gap-6">

              {/* PRÓXIMAS CHARLAS */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-base font-bold text-gray-900">
                    Próximas charlas
                  </h2>
                  <button
                    onClick={() => setActiveNav('experiencias')}
                    className="text-xs text-indigo-600 font-medium hover:underline"
                  >
                    Ver catálogo →
                  </button>
                </div>
                <div>
                  {proximasCharlas.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-sm">No hay charlas habilitadas próximamente.</p>
                      <button
                        onClick={() => setActiveNav('experiencias')}
                        className="mt-3 text-xs text-indigo-600 font-medium hover:underline"
                      >
                        Explorar experiencias →
                      </button>
                    </div>
                  ) : (
                    proximasCharlas.slice(0, 4).map(exp => (
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

              {/* ACTIVIDAD RECIENTE */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-base font-bold text-gray-900">
                    Actividad reciente
                  </h2>
                </div>
                <div>
                  {actividadReciente.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-sm">No hay actividad reciente.</p>
                    </div>
                  ) : (
                    actividadReciente.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${item.color}`}>
                          {item.icono}
                        </div>
                        <p className="text-sm text-gray-700">{item.texto}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA — CALENDARIO */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-base font-bold text-gray-900">
                    {nombresMeses[mes]} {año}
                  </h2>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setMesCalendario(new Date(año, mes - 1, 1))}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center text-sm transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setMesCalendario(new Date(año, mes + 1, 1))}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center text-sm transition-colors"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Días de semana */}
                <div className="grid grid-cols-7 mb-1">
                  {diasSemana.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: offsetInicio }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => (
                    <div
                      key={dia}
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium relative ${
                        esHoy(dia)
                          ? 'bg-indigo-600 text-white'
                          : diasConCharlas.has(dia)
                          ? 'bg-indigo-100 text-indigo-700 font-bold'
                          : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {dia}
                      {diasConCharlas.has(dia) && !esHoy(dia) && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Leyenda */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Este mes</p>
                  {proximasCharlas
                    .filter(e => {
                      const f = new Date(e.fecha)
                      return f.getFullYear() === año && f.getMonth() === mes
                    })
                    .slice(0, 3)
                    .map(exp => (
                      <div key={exp.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <p className="text-xs text-gray-600 truncate">{exp.titulo}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">
                          {new Date(exp.fecha).getDate()}
                        </span>
                      </div>
                    ))
                  }
                  {proximasCharlas.filter(e => {
                    const f = new Date(e.fecha)
                    return f.getFullYear() === año && f.getMonth() === mes
                  }).length === 0 && (
                    <p className="text-xs text-gray-400">Sin charlas este mes</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCIAS */}
        {activeNav === 'experiencias' && (
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
              <select
                className="bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                value={filtroModalidad}
                onChange={e => setFiltroModalidad(e.target.value)}
              >
                <option value="">Todas las modalidades</option>
                <option value="virtual">Virtual</option>
                <option value="presencial">Presencial</option>
                <option value="hibrida">Híbrida</option>
              </select>
              <button
                onClick={() => { setFiltroArea(''); setFiltroModalidad('') }}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                Limpiar filtros
              </button>
              <span className="ml-auto text-sm text-gray-400">{experienciasFiltradas.length} experiencias</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {experienciasFiltradas.length === 0 ? (
                <div className="col-span-3 bg-white rounded-2xl p-12 border border-gray-100 text-center">
                  <p className="text-gray-400 text-sm">No hay experiencias disponibles todavía.</p>
                </div>
              ) : (
                experienciasFiltradas.map(exp => {
                  const habilitada = experienciasHabilitadas.find(h => h.experiencia_id === exp.id)
                  const cuposDisp = getCuposDisponibles(exp.id, exp.cupos_totales)

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
                            {habilitada ? (
                              <span className="bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">✓ Habilitada</span>
                            ) : (
                              <span className={cuposDisp > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                                {cuposDisp > 0 ? `${cuposDisp} cupos` : 'Sin cupos'}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setCuposModal(Math.min(10, cuposDisp))
                              setExperienciaSeleccionada(exp)
                            }}
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

        {/* ALUMNOS */}
        {activeNav === 'alumnos' && (
          <>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
              <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg font-bold text-gray-900 mb-4">
                Agregar alumno
              </h2>
              {errorAlumno && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorAlumno}</div>
              )}
              {successAlumno && (
                <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">✓ {successAlumno}</div>
              )}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nombre completo</label>
                  <input
                    className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                    value={nombreAlumno}
                    onChange={e => setNombreAlumno(e.target.value)}
                    placeholder="Nombre del alumno"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
                  <input
                    className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                    type="email"
                    value={emailAlumno}
                    onChange={e => setEmailAlumno(e.target.value)}
                    placeholder="email@alumno.com"
                  />
                </div>
                <button
                  onClick={handleAgregarAlumno}
                  disabled={agregando || !nombreAlumno || !emailAlumno}
                  className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {agregando ? 'Agregando...' : 'Agregar alumno →'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg font-bold text-gray-900">
                  Alumnos ({alumnos.length})
                </h2>
              </div>
              {alumnos.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 text-sm">Todavía no cargaste alumnos.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Nombre</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Email</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Código asignado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alumnos.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{a.nombre}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{a.email}</td>
                        <td className="px-6 py-3">
                          <span className="font-mono text-sm font-semibold text-indigo-600">
                            {a.codigos_alumno?.codigo || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* CÓDIGOS */}
        {activeNav === 'codigos' && (
          <>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
              <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg font-bold text-gray-900 mb-4">
                Generar códigos
              </h2>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={cantidad}
                    onChange={e => setCantidad(Number(e.target.value))}
                    className="w-32 bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
                <div className="mt-5">
                  <button
                    onClick={handleGenerarCodigos}
                    disabled={generando}
                    className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {generando ? 'Generando...' : `Generar ${cantidad} códigos →`}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg font-bold text-gray-900">
                  Códigos generados ({codigos.length})
                </h2>
              </div>
              {codigos.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 text-sm">Todavía no generaste ningún código.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Código</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Asignado a</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {codigos.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-mono text-sm font-semibold text-gray-800">{c.codigo}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {c.nombre_alumno || <span className="text-gray-300">Sin asignar</span>}
                        </td>
                        <td className="px-6 py-3">
                          {c.usado ? (
                            <span className="text-xs bg-green-50 text-green-600 font-medium px-2.5 py-1 rounded-full">Registrado</span>
                          ) : c.email_alumno ? (
                            <span className="text-xs bg-yellow-50 text-yellow-600 font-medium px-2.5 py-1 rounded-full">Asignado</span>
                          ) : (
                            <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">Disponible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  )
}