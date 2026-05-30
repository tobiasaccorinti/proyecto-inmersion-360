'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Institucion = { id: string; nombre: string; prefijo: string; codigos_generados: number }
type Codigo = { id: string; codigo: string; usado: boolean; alumno_id: string | null; nombre_alumno: string | null; email_alumno: string | null }
type Alumno = { id: string; nombre: string; email: string; codigo_id: string | null; codigos_alumno: { codigo: string } | null }

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
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('codigos')
  const [cantidad, setCantidad] = useState(10)
  const [generando, setGenerando] = useState(false)

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
      .eq('estado', 'publicada')
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

  async function handleHabilitarExperiencia(experienciaId: string, cupos: number) {
    if (!institucion) return
    const { error } = await supabase
      .from('experiencia_instituciones')
      .insert({
        experiencia_id: experienciaId,
        institucion_id: institucion.id,
        cupos_reservados: cupos,
      })
    if (!error) await loadExperienciasHabilitadas(institucion.id)
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
  const codigosDisponibles = codigos.filter(c => !c.usado && !c.email_alumno).length

  const experienciasFiltradas = experienciasDisponibles
    .filter(e => (!filtroArea || e.area === filtroArea) && (!filtroModalidad || e.modalidad === filtroModalidad))

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex" style={{ fontFamily: "var(--font-body, sans-serif)" }}>

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

            <div className="flex flex-col gap-3">
              {experienciasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                  <p className="text-gray-400 text-sm">No hay experiencias disponibles todavía.</p>
                </div>
              ) : (
                experienciasFiltradas.map(exp => {
                  const habilitada = experienciasHabilitadas.find(h => h.experiencia_id === exp.id)
                  return (
                    <div key={exp.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 hover:border-indigo-200 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{exp.titulo}</p>
                          <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">{exp.area}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {exp.empresa} · {exp.modalidad} · {new Date(exp.fecha).toLocaleDateString('es-AR')} · {exp.duracion_minutos} min · {exp.cupos_totales} cupos
                        </p>
                        {exp.descripcion && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{exp.descripcion}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {habilitada ? (
                          <span className="text-xs bg-green-50 text-green-600 font-medium px-3 py-1.5 rounded-full">
                            ✓ Habilitada · {habilitada.cupos_reservados} cupos
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={exp.cupos_totales}
                              defaultValue={10}
                              id={`cupos-${exp.id}`}
                              className="w-16 bg-[#EEEFFE] border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all text-center"
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(`cupos-${exp.id}`) as HTMLInputElement
                                handleHabilitarExperiencia(exp.id, Number(input?.value || 10))
                              }}
                              className="text-xs bg-indigo-600 text-white font-medium px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors"
                            >
                              Habilitar
                            </button>
                          </div>
                        )}
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

        {/* DASHBOARD */}
        {activeNav === 'dashboard' && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <p className="text-gray-400 text-sm">Resumen general — próximamente</p>
          </div>
        )}

      </main>
    </div>
  )
}