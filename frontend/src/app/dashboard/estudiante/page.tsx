'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, type NavItem } from '@/components/Sidebar'
import { ExperienciaCard } from '@/components/ExperienciaCard'
import { ExperienciaModal } from '@/components/ExperienciaModal'
import { experienciasService } from '@/services/experienciasService'
import { inscripcionesService } from '@/services/inscripcionesService'
import { feedbackService } from '@/services/feedbackService'
import { empresasService } from '@/services/empresasService'
import { authService } from '@/services/authService'
import { AREAS, NOMBRES_MESES, DIAS_SEMANA } from '@/utils/constants'
import type { Experiencia, Profile, Inscripcion, Feedback, ReputacionEmpresa } from '@/types'

const NAV_ITEMS: NavItem[] = [
  { id: 'explorar', label: 'Explorar', icon: '◎' },
  { id: 'inscripciones', label: 'Mis inscripciones', icon: '✓' },
  { id: 'calendario', label: 'Calendario', icon: '▦' },
]

function Estrellas({ valor, onChange }: { valor: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`text-2xl transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${n <= valor ? 'text-amber-400' : 'text-gray-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function FeedbackModal({
  experiencia,
  onClose,
  onEnviado,
}: {
  experiencia: Experiencia
  onClose: () => void
  onEnviado: (fb: Feedback) => void
}) {
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (calificacion === 0) { setError('Seleccioná una calificación'); return }
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('inspira_token')!
      const fb = await feedbackService.enviar(token, {
        experiencia_id: experiencia.id,
        calificacion,
        comentario: comentario.trim() || undefined,
      })
      onEnviado(fb)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Dejar feedback</h2>
        <p className="text-sm text-gray-400 mb-5 truncate">{experiencia.titulo}</p>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">¿Cómo calificarías esta experiencia?</label>
            <Estrellas valor={calificacion} onChange={setCalificacion} />
            <p className="text-xs text-gray-400 mt-1">
              {calificacion === 1 && 'Muy mala'}
              {calificacion === 2 && 'Mala'}
              {calificacion === 3 && 'Regular'}
              {calificacion === 4 && 'Buena'}
              {calificacion === 5 && '¡Excelente!'}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Comentario <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={3}
              placeholder="¿Qué te gustó? ¿Qué mejorarías?"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DashboardEstudiantePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [misFeedbacks, setMisFeedbacks] = useState<Feedback[]>([])
  const [reputaciones, setReputaciones] = useState<ReputacionEmpresa[]>([])
  const [recomendadas, setRecomendadas] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('explorar')
  const [token, setToken] = useState<string | null>(null)
  const [seleccionada, setSeleccionada] = useState<Experiencia | null>(null)
  const [feedbackExp, setFeedbackExp] = useState<Experiencia | null>(null)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroModalidadRec, setFiltroModalidadRec] = useState('')
  const [mesCalendario, setMesCalendario] = useState(new Date())

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem('inspira_token')
      if (!stored) { router.push('/auth/login'); return }
      setToken(stored)
      try {
        const me = await authService.me(stored)
        if (me.role !== 'estudiante') { router.push('/dashboard'); return }
        setProfile(me)
        const [exps, insc, fbs, reps, recs] = await Promise.all([
          experienciasService.listar(me.institucion_id ? { institucion_id: me.institucion_id } : {}, stored),
          inscripcionesService.listarMias(stored),
          feedbackService.misFeedbacks(stored),
          empresasService.listarReputaciones(stored),
          experienciasService.recomendadasParaMi(stored).catch(() => []),
        ])
        setExperiencias(exps)
        setInscripciones(insc)
        setMisFeedbacks(fbs)
        setReputaciones(reps)
        setRecomendadas(recs)
      } catch {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  async function handleInscribir(experienciaId: string) {
    if (!token) return
    setInscribiendo(true)
    try {
      const nueva = await inscripcionesService.inscribir(experienciaId, token)
      setInscripciones((prev) => [nueva, ...prev])
      setSeleccionada(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al inscribirse')
    } finally {
      setInscribiendo(false)
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

  const inscripcionIds = new Set(inscripciones.map((i) => i.experiencia_id))
  const feedbackIds = new Set(misFeedbacks.map((f) => f.experiencia_id))
  const expFiltradas = experiencias.filter((e) => !filtroArea || e.area === filtroArea)
  const repPorEmpresa = Object.fromEntries(reputaciones.map((r) => [r.empresa_id, r]))
  const ahora = new Date()

  const inscripcionesPasadas = inscripciones.filter(
    (i) => i.experiencias && new Date(i.experiencias.fecha) < ahora
  )
  const inscripcionesProximas = inscripciones.filter(
    (i) => i.experiencias && new Date(i.experiencias.fecha) >= ahora
  )

  const año = mesCalendario.getFullYear()
  const mes = mesCalendario.getMonth()
  const primerDia = new Date(año, mes, 1).getDay()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const offsetInicio = primerDia === 0 ? 6 : primerDia - 1
  const hoy = new Date()
  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear()

  const proximasInscriptas = inscripciones
    .map((i) => i.experiencias)
    .filter((e): e is Experiencia => !!e && new Date(e.fecha) >= ahora)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  const diasConCharlas = new Set(
    proximasInscriptas
      .filter((e) => { const f = new Date(e.fecha); return f.getFullYear() === año && f.getMonth() === mes })
      .map((e) => new Date(e.fecha).getDate())
  )

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex flex-col md:flex-row" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {seleccionada && (
        <ExperienciaModal
          experiencia={seleccionada}
          yaInscripto={inscripcionIds.has(seleccionada.id)}
          inscribiendo={inscribiendo}
          onClose={() => setSeleccionada(null)}
          onInscribir={handleInscribir}
        />
      )}

      {feedbackExp && (
        <FeedbackModal
          experiencia={feedbackExp}
          onClose={() => setFeedbackExp(null)}
          onEnviado={(fb) => {
            setMisFeedbacks((prev) => [...prev, fb])
            setFeedbackExp(null)
          }}
        />
      )}

      <Sidebar
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        userName={profile?.full_name ?? ''}
        userRole="Estudiante"
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="bg-indigo-600 rounded-2xl p-6 md:p-8 mb-6 shadow-lg shadow-indigo-100">
          <p className="text-indigo-200 text-xs md:text-sm mb-1 uppercase font-bold tracking-wider">Panel de estudiante</p>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-2xl md:text-3xl font-bold text-white truncate">
            ¡Hola, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">Explorá experiencias y elegí tu camino.</p>
        </div>

        {/* Explorar */}
        {activeNav === 'explorar' && (
          <div className="flex flex-col gap-6">
            {/* Sección "Para vos" — filtro solo por modalidad */}
            {recomendadas.length > 0 && (
              <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-sm font-bold text-gray-900">Para vos</p>
                      <p className="text-xs text-gray-400">Basadas en tus inscripciones anteriores</p>
                    </div>
                  </div>
                  <select
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none bg-gray-50"
                    value={filtroModalidadRec}
                    onChange={(e) => setFiltroModalidadRec(e.target.value)}
                  >
                    <option value="">Todas las modalidades</option>
                    <option value="virtual">Virtual</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>
                {(() => {
                  const filtradas = recomendadas.filter((e) => !filtroModalidadRec || e.modalidad === filtroModalidadRec)
                  return filtradas.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay recomendaciones para esa modalidad.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtradas.map((exp) => (
                        <div key={exp.id} className="relative">
                          <ExperienciaCard experiencia={exp} yaInscripto={inscripcionIds.has(exp.id)} onClick={setSeleccionada} reputacion={repPorEmpresa[exp.creado_por] ?? null} />
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🎯 Para vos</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Sección todas las experiencias — filtro por área */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900">
                  Todas las experiencias
                </h2>
                <select
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none bg-gray-50 flex-1 md:flex-none"
                  value={filtroArea}
                  onChange={(e) => setFiltroArea(e.target.value)}
                >
                  <option value="">Todas las áreas</option>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              {expFiltradas.length === 0 ? (
                <p className="text-sm text-gray-400">No hay experiencias disponibles.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expFiltradas.map((exp) => (
                    <ExperienciaCard key={exp.id} experiencia={exp} yaInscripto={inscripcionIds.has(exp.id)} onClick={setSeleccionada} reputacion={repPorEmpresa[exp.creado_por] ?? null} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mis inscripciones */}
        {activeNav === 'inscripciones' && (
          <div className="flex flex-col gap-6">
            {/* Próximas */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
              <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-4">
                Próximas experiencias
              </h2>
              {inscripcionesProximas.length === 0 ? (
                <p className="text-sm text-gray-400">No tenés experiencias próximas.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inscripcionesProximas.map((i) => i.experiencias && (
                    <ExperienciaCard key={i.id} experiencia={i.experiencias} yaInscripto onClick={setSeleccionada} />
                  ))}
                </div>
              )}
            </div>

            {/* Pasadas */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
              <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-4">
                Experiencias pasadas
              </h2>
              {inscripcionesPasadas.length === 0 ? (
                <p className="text-sm text-gray-400">Todavía no asististe a ninguna experiencia.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {inscripcionesPasadas.map((i) => {
                    if (!i.experiencias) return null
                    const yaFeedback = feedbackIds.has(i.experiencias.id)
                    const fb = misFeedbacks.find((f) => f.experiencia_id === i.experiencias!.id)
                    return (
                      <div key={i.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{i.experiencias.titulo}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {i.experiencias.empresa} · {new Date(i.experiencias.fecha).toLocaleDateString('es-AR')}
                          </p>
                          {yaFeedback && fb && (
                            <div className="flex gap-0.5 mt-1">
                              {[1,2,3,4,5].map((n) => (
                                <span key={n} className={`text-sm ${n <= fb.calificacion ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {yaFeedback ? (
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">✓ Feedback enviado</span>
                        ) : (
                          <button
                            onClick={() => setFeedbackExp(i.experiencias!)}
                            className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors whitespace-nowrap"
                          >
                            ⭐ Dejar feedback
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendario */}
        {activeNav === 'calendario' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900">
                {NOMBRES_MESES[mes]} {año}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setMesCalendario(new Date(año, mes - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100">←</button>
                <button onClick={() => setMesCalendario(new Date(año, mes + 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100">→</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2 text-center">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-[10px] md:text-xs font-bold text-gray-400 py-1 uppercase tracking-widest">{d}</div>
              ))}
              {Array.from({ length: offsetInicio }).map((_, i) => <div key={`offset-${i}`} />)}
              {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => (
                <div key={dia} className={[
                  'aspect-square flex items-center justify-center rounded-xl text-xs md:text-sm font-medium transition-all',
                  esHoy(dia) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : '',
                  diasConCharlas.has(dia) && !esHoy(dia) ? 'bg-indigo-50 text-indigo-700 font-bold' : '',
                  !esHoy(dia) && !diasConCharlas.has(dia) ? 'text-gray-700 hover:bg-gray-50' : '',
                ].join(' ')}>{dia}</div>
              ))}
            </div>
            {proximasInscriptas.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Próximas experiencias</p>
                <div className="flex flex-col gap-3">
                  {proximasInscriptas.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-gray-50/50">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="text-gray-700 font-semibold truncate">{e.titulo}</span>
                      <span className="text-gray-400 ml-auto text-xs whitespace-nowrap">{new Date(e.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
