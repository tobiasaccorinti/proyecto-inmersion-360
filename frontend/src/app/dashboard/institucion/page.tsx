'use client'

/**
 * DashboardInstitucionPage — Panel para gestionar códigos, alumnos y experiencias habilitadas.
 * Ruta: /dashboard/institucion
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, type NavItem } from '@/components/Sidebar'
import { ExperienciaCard } from '@/components/ExperienciaCard'
import { ExperienciaModal } from '@/components/ExperienciaModal'
import { experienciasService } from '@/services/experienciasService'
import { institucionesService } from '@/services/institucionesService'
import { authService } from '@/services/authService'
import { useFormState } from '@/hooks/useFormState'
import { feedbackService } from '@/services/feedbackService'
import { empresasService } from '@/services/empresasService'
import { AREAS, MODALIDADES } from '@/utils/constants'
import type { Experiencia, Profile, Institucion, CodigoAlumno, Feedback, ReputacionEmpresa } from '@/types'

const NAV_ITEMS: NavItem[] = [
  { id: 'experiencias', label: 'Experiencias', icon: '◎' },
  { id: 'feedback', label: 'Feedback alumnos', icon: '⭐' },
  { id: 'codigos', label: 'Códigos', icon: '🔑' },
  { id: 'alumnos', label: 'Alumnos', icon: '🎓' },
]

export default function DashboardInstitucionPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [institucion, setInstitucion] = useState<Institucion | null>(null)
  const [codigos, setCodigos] = useState<CodigoAlumno[]>([])
  const [experienciasDisponibles, setExperienciasDisponibles] = useState<Experiencia[]>([])
  const [habilitadas, setHabilitadas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('experiencias')
  const [token, setToken] = useState<string | null>(null)
  const [feedbacksAlumnos, setFeedbacksAlumnos] = useState<Feedback[]>([])
  const [reputaciones, setReputaciones] = useState<ReputacionEmpresa[]>([])
  const [recomendadas, setRecomendadas] = useState<Experiencia[]>([])
  const [filtroAreaRec, setFiltroAreaRec] = useState('')
  const [filtroModalidadRec, setFiltroModalidadRec] = useState('')
  const [filtrosRecAbiertos, setFiltrosRecAbiertos] = useState(false)
  const [seleccionada, setSeleccionada] = useState<Experiencia | null>(null)
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [detalle, setDetalle] = useState<Experiencia | null>(null)
  const [detalleFeedbacks, setDetalleFeedbacks] = useState<Feedback[]>([])
  const [cantidad, setCantidad] = useState(10)
  const [cuposModal, setCuposModal] = useState(10)

  const { loading: agLoading, error: agError, success: agSuccess, run: agRun, setSuccess: agSetSuccess } = useFormState()
  const [nombreAlumno, setNombreAlumno] = useState('')
  const [emailAlumno, setEmailAlumno] = useState('')

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem('inspira_token')
      if (!stored) { router.push('/auth/login'); return }
      setToken(stored)
      try {
        const me = await authService.me(stored)
        if (me.role !== 'institucion') { router.push('/dashboard'); return }
        setProfile(me)
        const [inst, exps, cods, habExps, fbs, reps, recs] = await Promise.all([
          institucionesService.obtenerMia(stored),
          experienciasService.listar({}, stored),
          institucionesService.listarCodigos(stored),
          institucionesService.listarExperienciasHabilitadas(stored),
          feedbackService.resumenInstitucion(stored),
          empresasService.listarReputaciones(stored),
          institucionesService.recomendaciones(stored),
        ])
        setFeedbacksAlumnos(fbs)
        setReputaciones(reps)
        setRecomendadas(recs)
        setInstitucion(inst)
        setExperienciasDisponibles(exps)
        setCodigos(cods)
        setHabilitadas(habExps.map((h) => h.experiencia_id))
      } catch {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  async function handleGenerarCodigos() {
    if (!token) return
    try {
      const nuevos = await institucionesService.generarCodigos(cantidad, token)
      setCodigos((prev) => [...nuevos, ...prev])
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al generar códigos')
    }
  }

  async function handleHabilitar(experienciaId: string) {
    if (!token) return
    try {
      await institucionesService.habilitarExperiencia(
        { experiencia_id: experienciaId, cupos_reservados: cuposModal },
        token
      )
      setHabilitadas((prev) => [...prev, experienciaId])
      setSeleccionada(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al habilitar')
    }
  }

  async function handleDeshabilitar(experienciaId: string) {
    if (!token) return
    try {
      await institucionesService.deshabilitarExperiencia(experienciaId, token)
      setHabilitadas((prev) => prev.filter((id) => id !== experienciaId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al deshabilitar')
    }
  }

  async function handleAgregarAlumno(e: React.FormEvent) {
    e.preventDefault()
    await agRun(async () => {
      if (!token) return
      await institucionesService.agregarAlumno({ nombre: nombreAlumno, email: emailAlumno }, token)
      agSetSuccess('Alumno agregado. Se generó su código automáticamente.')
      setNombreAlumno('')
      setEmailAlumno('')
      const cods = await institucionesService.listarCodigos(token)
      setCodigos(cods)
    })
  }

  async function handleAbrirDetalle(exp: Experiencia) {
    setDetalle(exp)
    setDetalleFeedbacks([])
    if (token) {
      try {
        const fbs = await feedbackService.listarDeExperienciaInstitucion(exp.id, token)
        setDetalleFeedbacks(fbs)
      } catch { /* sin reseñas */ }
    }
  }

  function handleLogout() {
    localStorage.removeItem('inspira_token')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEEFFE] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    )
  }

  const expFiltradas = experienciasDisponibles
    .filter((e) => (!filtroArea || e.area === filtroArea) && (!filtroModalidad || e.modalidad === filtroModalidad))
    .sort((a, b) => {
      if (ordenarPor === 'fecha-asc') return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      if (ordenarPor === 'fecha-desc') return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      if (ordenarPor === 'cupos') return b.cupos_totales - a.cupos_totales
      return 0
    })
  const repPorEmpresa = Object.fromEntries(reputaciones.map((r) => [r.empresa_id, r]))
  const codigosUsados = codigos.filter((c) => c.usado).length
  const inputClass =
    'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all'

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex flex-col md:flex-row" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {detalle && (
        <ExperienciaModal
          experiencia={detalle}
          soloLectura
          yaInscripto={false}
          inscribiendo={false}
          onClose={() => { setDetalle(null); setDetalleFeedbacks([]) }}
          onInscribir={() => {}}
          feedbacks={detalleFeedbacks}
        />
      )}
      {/* Modal habilitar/deshabilitar experiencia */}
      {seleccionada && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
            <h2
              style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
              className="text-lg font-bold text-gray-900 mb-2 truncate"
            >
              {seleccionada.titulo}
            </h2>
            <p className="text-sm text-gray-500 mb-4 truncate">
              {seleccionada.empresa} · {seleccionada.area} · {seleccionada.modalidad}
            </p>
            {!habilitadas.includes(seleccionada.id) ? (
              <>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Cupos a reservar</label>
                <input
                  type="number"
                  className={inputClass}
                  value={cuposModal}
                  min={1}
                  onChange={(e) => setCuposModal(Number(e.target.value))}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setSeleccionada(null)}
                    className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-full hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleHabilitar(seleccionada.id)}
                    className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-full hover:bg-indigo-700"
                  >
                    Habilitar →
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-green-600 mb-4">✓ Esta experiencia ya está habilitada para tu institución.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSeleccionada(null)}
                    className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-full"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => handleDeshabilitar(seleccionada.id)}
                    className="flex-1 bg-red-50 text-red-600 text-sm font-semibold py-2.5 rounded-full hover:bg-red-100"
                  >
                    Deshabilitar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Sidebar
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        userName={profile?.full_name ?? ''}
        userRole="Institución"
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {/* Banner */}
        <div className="bg-indigo-600 rounded-2xl p-6 md:p-8 mb-6">
          <p className="text-indigo-200 text-xs md:text-sm mb-1 uppercase font-bold tracking-wider">Panel de institución</p>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-2xl md:text-3xl font-bold text-white truncate">
            {institucion?.nombre ?? profile?.full_name} 🏫
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">
            Prefijo: <strong>{institucion?.prefijo}</strong> · Gestioná experiencias y alumnos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center sm:text-left">
          {[
            { label: 'Códigos generados', value: codigos.length },
            { label: 'Códigos usados', value: codigosUsados },
            { label: 'Experiencias habilitadas', value: habilitadas.length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-xl md:text-2xl font-bold text-gray-900">
                {s.value}
              </p>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recomendadas */}
        {activeNav === 'experiencias' && recomendadas.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-base font-bold text-indigo-800">
                    Recomendadas para tu institución
                  </h2>
                  <p className="text-xs text-indigo-400 mt-0.5">Basadas en tu orientación · Todavía no las habilitaste</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setFiltrosRecAbiertos((v) => !v)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                    filtroAreaRec || filtroModalidadRec
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                  </svg>
                  Filtros
                  {[filtroAreaRec, filtroModalidadRec].filter(Boolean).length > 0 && (
                    <span className="bg-white text-indigo-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {[filtroAreaRec, filtroModalidadRec].filter(Boolean).length}
                    </span>
                  )}
                </button>
                {filtrosRecAbiertos && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 p-4 flex flex-col gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Área</p>
                      <div className="flex flex-wrap gap-1.5">
                        {AREAS.map((a) => (
                          <button key={a} onClick={() => setFiltroAreaRec(filtroAreaRec === a ? '' : a)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filtroAreaRec === a ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Modalidad</p>
                      <div className="flex gap-1.5">
                        {(['virtual', 'presencial', 'hibrida'] as const).map((m) => (
                          <button key={m} onClick={() => setFiltroModalidadRec(filtroModalidadRec === m ? '' : m)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all capitalize ${filtroModalidadRec === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(filtroAreaRec || filtroModalidadRec) && (
                      <button onClick={() => { setFiltroAreaRec(''); setFiltroModalidadRec('') }}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold text-left">
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {(() => {
              const filtradas = recomendadas.filter(
                (e) => (!filtroAreaRec || e.area === filtroAreaRec) && (!filtroModalidadRec || e.modalidad === filtroModalidadRec)
              )
              return filtradas.length === 0 ? (
                <p className="text-sm text-indigo-400">No hay recomendaciones para esos filtros.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtradas.map((exp) => (
                    <div key={exp.id} className="relative group h-full">
                      <ExperienciaCard
                        experiencia={exp}
                        mostrarEstado
                        onClick={setSeleccionada}
                        reputacion={repPorEmpresa[exp.creado_por] ?? null}
                      />
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✨ Rec.
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAbrirDetalle(exp) }}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 border border-gray-100"
                        title="Ver detalles"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {/* Gestión de experiencias */}
        {activeNav === 'experiencias' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900">
                Gestión de experiencias
              </h2>
              <div className="relative">
                <button
                  onClick={() => setFiltrosAbiertos((v) => !v)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                    filtroArea || filtroModalidad || ordenarPor
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                  </svg>
                  Filtros
                  {[filtroArea, filtroModalidad, ordenarPor].filter(Boolean).length > 0 && (
                    <span className="bg-white text-indigo-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {[filtroArea, filtroModalidad, ordenarPor].filter(Boolean).length}
                    </span>
                  )}
                </button>
                {filtrosAbiertos && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 p-4 flex flex-col gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Área</p>
                      <div className="flex flex-wrap gap-1.5">
                        {AREAS.map((a) => (
                          <button key={a} onClick={() => setFiltroArea(filtroArea === a ? '' : a)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filtroArea === a ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Modalidad</p>
                      <div className="flex gap-1.5">
                        {(['virtual', 'presencial', 'hibrida'] as const).map((m) => (
                          <button key={m} onClick={() => setFiltroModalidad(filtroModalidad === m ? '' : m)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all capitalize ${filtroModalidad === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ordenar por</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { value: 'fecha-asc', label: 'Más próxima' },
                          { value: 'fecha-desc', label: 'Más lejana' },
                          { value: 'cupos', label: 'Más cupos' },
                        ].map((op) => (
                          <button key={op.value} onClick={() => setOrdenarPor(ordenarPor === op.value ? '' : op.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${ordenarPor === op.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                            {op.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(filtroArea || filtroModalidad || ordenarPor) && (
                      <button onClick={() => { setFiltroArea(''); setFiltroModalidad(''); setOrdenarPor('') }}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold text-left">
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {expFiltradas.map((exp) => (
                <div key={exp.id} className="relative group h-full">
                  <ExperienciaCard
                    experiencia={exp}
                    mostrarEstado
                    onClick={setSeleccionada}
                    reputacion={repPorEmpresa[exp.creado_por] ?? null}
                  />
                  {habilitadas.includes(exp.id) && (
                    <div className="absolute top-2 left-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      Habilitada
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAbrirDetalle(exp) }}
                    className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 border border-gray-100"
                    title="Ver detalles"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback alumnos */}
        {activeNav === 'feedback' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-2">
              Feedback de tus alumnos
            </h2>
            <p className="text-sm text-gray-400 mb-6">Conocé qué experiencias les gustaron más y qué áreas despiertan más interés.</p>
            {feedbacksAlumnos.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no hay feedback de tus alumnos.</p>
            ) : (() => {
              // Agrupar por área para ver intereses
              const porArea: Record<string, { total: number; suma: number }> = {}
              feedbacksAlumnos.forEach((fb) => {
                const area = fb.experiencias?.area ?? 'Sin área'
                if (!porArea[area]) porArea[area] = { total: 0, suma: 0 }
                porArea[area].total++
                porArea[area].suma += fb.calificacion
              })
              const areasOrdenadas = Object.entries(porArea)
                .map(([area, { total, suma }]) => ({ area, total, promedio: Math.round((suma / total) * 10) / 10 }))
                .sort((a, b) => b.total - a.total)

              return (
                <div className="flex flex-col gap-6">
                  {/* Resumen por área */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Interés por área</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {areasOrdenadas.map(({ area, total, promedio }) => (
                        <div key={area} className="bg-indigo-50 rounded-xl p-3 text-center">
                          <p className="font-bold text-indigo-700 text-lg">{promedio}</p>
                          <div className="flex justify-center gap-0.5 my-1">
                            {[1,2,3,4,5].map((n) => (
                              <span key={n} className={`text-xs ${n <= Math.round(promedio) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-indigo-600 truncate">{area}</p>
                          <p className="text-xs text-indigo-400">{total} reseña{total !== 1 ? 's' : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedbacks individuales */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Últimas reseñas</p>
                    <div className="flex flex-col gap-2">
                      {feedbacksAlumnos.slice(0, 20).map((fb, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{fb.experiencias?.titulo ?? '—'}</p>
                            <p className="text-xs text-gray-400">{fb.experiencias?.empresa} · {fb.experiencias?.area}</p>
                            {fb.comentario && <p className="text-xs text-gray-500 italic mt-1">&ldquo;{fb.comentario}&rdquo;</p>}
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
                            {[1,2,3,4,5].map((n) => (
                              <span key={n} className={`text-sm ${n <= fb.calificacion ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Generar códigos */}
        {activeNav === 'codigos' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-4">
              Generar códigos de alumno
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 items-end mb-8">
              <div className="w-full sm:w-32">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Cantidad</label>
                <input
                  type="number"
                  className={inputClass}
                  value={cantidad}
                  min={1}
                  max={200}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>
              <button
                onClick={handleGenerarCodigos}
                className="w-full sm:w-auto bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700"
              >
                Generar →
              </button>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Código</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Alumno</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Email</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {codigos.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-indigo-600 font-bold">{c.codigo}</td>
                      <td className="px-4 py-3 text-gray-700">{c.nombre_alumno ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{c.email_alumno ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.usado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {c.usado ? 'Usado' : 'Disponible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agregar alumno */}
        {activeNav === 'alumnos' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-4">
              Agregar alumno
            </h2>
            {agError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {agError}
              </div>
            )}
            {agSuccess && (
              <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
                ✓ {agSuccess}
              </div>
            )}
            <form onSubmit={handleAgregarAlumno} className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nombre del alumno</label>
                <input
                  className={inputClass}
                  value={nombreAlumno}
                  onChange={(e) => setNombreAlumno(e.target.value)}
                  placeholder="Juan García"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email del alumno</label>
                <input
                  type="email"
                  className={inputClass}
                  value={emailAlumno}
                  onChange={(e) => setEmailAlumno(e.target.value)}
                  placeholder="juan@escuela.edu.ar"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={agLoading}
                className="bg-indigo-600 text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-100"
              >
                {agLoading ? 'Agregando...' : 'Agregar alumno y generar código →'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  )
}
