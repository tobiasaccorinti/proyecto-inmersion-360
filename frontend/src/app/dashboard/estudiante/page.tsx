'use client'

/**
 * DashboardEstudiantePage — Panel de estudiante para explorar e inscribirse a experiencias.
 * Ruta: /dashboard/estudiante
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, type NavItem } from '@/components/Sidebar'
import { ExperienciaCard } from '@/components/ExperienciaCard'
import { ExperienciaModal } from '@/components/ExperienciaModal'
import { experienciasService } from '@/services/experienciasService'
import { inscripcionesService } from '@/services/inscripcionesService'
import { authService } from '@/services/authService'
import { AREAS, NOMBRES_MESES, DIAS_SEMANA } from '@/utils/constants'
import type { Experiencia, Profile, Inscripcion } from '@/types'

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: '⊞' },
  { id: 'explorar', label: 'Explorar', icon: '◎' },
  { id: 'inscripciones', label: 'Mis inscripciones', icon: '✓' },
  { id: 'calendario', label: 'Calendario', icon: '▦' },
]

export default function DashboardEstudiantePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [token, setToken] = useState<string | null>(null)
  const [seleccionada, setSeleccionada] = useState<Experiencia | null>(null)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [filtroArea, setFiltroArea] = useState('')
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
        const [exps, insc] = await Promise.all([
          experienciasService.listar(
            me.institucion_id ? { institucion_id: me.institucion_id } : {},
            stored
          ),
          inscripcionesService.listarMias(stored),
        ])
        setExperiencias(exps)
        setInscripciones(insc)
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
  const expFiltradas = experiencias.filter((e) => !filtroArea || e.area === filtroArea)
  const proximasInscriptas = inscripciones
    .map((i) => i.experiencias)
    .filter((e): e is Experiencia => !!e && new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // Datos de calendario
  const año = mesCalendario.getFullYear()
  const mes = mesCalendario.getMonth()
  const primerDia = new Date(año, mes, 1).getDay()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const offsetInicio = primerDia === 0 ? 6 : primerDia - 1
  const hoy = new Date()
  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear()
  const diasConCharlas = new Set(
    proximasInscriptas
      .filter((e) => {
        const f = new Date(e.fecha)
        return f.getFullYear() === año && f.getMonth() === mes
      })
      .map((e) => new Date(e.fecha).getDate())
  )

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {seleccionada && (
        <ExperienciaModal
          experiencia={seleccionada}
          yaInscripto={inscripcionIds.has(seleccionada.id)}
          inscribiendo={inscribiendo}
          onClose={() => setSeleccionada(null)}
          onInscribir={handleInscribir}
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

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Banner bienvenida */}
        <div className="bg-indigo-600 rounded-2xl p-8 mb-6">
          <p className="text-indigo-200 text-sm mb-1">Panel de estudiante</p>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-3xl font-bold text-white">
            ¡Hola, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">Explorá experiencias y elegí tu camino.</p>
        </div>

        {/* Explorar experiencias */}
        {(activeNav === 'explorar' || activeNav === 'dashboard') && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900">
                Experiencias disponibles
              </h2>
              <select
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none"
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
              <div className="grid grid-cols-3 gap-4">
                {expFiltradas.map((exp) => (
                  <ExperienciaCard
                    key={exp.id}
                    experiencia={exp}
                    yaInscripto={inscripcionIds.has(exp.id)}
                    onClick={setSeleccionada}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mis inscripciones */}
        {activeNav === 'inscripciones' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-4">
              Mis inscripciones
            </h2>
            {inscripciones.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no te inscribiste en ninguna experiencia.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {inscripciones.map((i) => i.experiencias && (
                  <ExperienciaCard
                    key={i.id}
                    experiencia={i.experiencias}
                    yaInscripto
                    onClick={setSeleccionada}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendario */}
        {activeNav === 'calendario' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900">
                {NOMBRES_MESES[mes]} {año}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMesCalendario(new Date(año, mes - 1))}
                  className="text-gray-400 hover:text-gray-700 px-2"
                >←</button>
                <button
                  onClick={() => setMesCalendario(new Date(año, mes + 1))}
                  className="text-gray-400 hover:text-gray-700 px-2"
                >→</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
              {Array.from({ length: offsetInicio }).map((_, i) => (
                <div key={`offset-${i}`} />
              ))}
              {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => (
                <div
                  key={dia}
                  className={[
                    'aspect-square flex items-center justify-center rounded-full text-sm font-medium cursor-default',
                    esHoy(dia) ? 'bg-indigo-600 text-white' : '',
                    diasConCharlas.has(dia) && !esHoy(dia) ? 'bg-indigo-100 text-indigo-700 font-bold' : '',
                    !esHoy(dia) && !diasConCharlas.has(dia) ? 'text-gray-700' : '',
                  ].join(' ')}
                >
                  {dia}
                </div>
              ))}
            </div>
            {proximasInscriptas.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Próximas charlas</p>
                <div className="flex flex-col gap-2">
                  {proximasInscriptas.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{e.titulo}</span>
                      <span className="text-gray-400 ml-auto">{new Date(e.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
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
