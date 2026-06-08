'use client'

/**
 * DashboardInstitucionPage — Panel para gestionar códigos, alumnos y experiencias habilitadas.
 * Ruta: /dashboard/institucion
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, type NavItem } from '@/components/Sidebar'
import { ExperienciaCard } from '@/components/ExperienciaCard'
import { experienciasService } from '@/services/experienciasService'
import { institucionesService } from '@/services/institucionesService'
import { authService } from '@/services/authService'
import { useFormState } from '@/hooks/useFormState'
import { AREAS, MODALIDADES } from '@/utils/constants'
import type { Experiencia, Profile, Institucion, CodigoAlumno } from '@/types'

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'experiencias', label: 'Experiencias', icon: '◎' },
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
  const [activeNav, setActiveNav] = useState('dashboard')
  const [token, setToken] = useState<string | null>(null)
  const [seleccionada, setSeleccionada] = useState<Experiencia | null>(null)
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
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
        const [inst, exps, cods, habExps] = await Promise.all([
          institucionesService.obtenerMia(stored),
          experienciasService.listar({}, stored),
          institucionesService.listarCodigos(stored),
          institucionesService.listarExperienciasHabilitadas(stored),
        ])
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

  const expFiltradas = experienciasDisponibles.filter(
    (e) => (!filtroArea || e.area === filtroArea) && (!filtroModalidad || e.modalidad === filtroModalidad)
  )
  const codigosUsados = codigos.filter((c) => c.usado).length
  const inputClass =
    'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all'

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {/* Modal habilitar/deshabilitar experiencia */}
      {seleccionada && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <h2
              style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
              className="text-lg font-bold text-gray-900 mb-2"
            >
              {seleccionada.titulo}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
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

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Banner */}
        <div className="bg-indigo-600 rounded-2xl p-8 mb-6">
          <p className="text-indigo-200 text-sm mb-1">Panel de institución</p>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-3xl font-bold text-white">
            {institucion?.nombre ?? profile?.full_name} 🏫
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">
            Prefijo: <strong>{institucion?.prefijo}</strong> · Gestioná experiencias y alumnos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Códigos generados', value: codigos.length },
            { label: 'Códigos usados', value: codigosUsados },
            { label: 'Experiencias habilitadas', value: habilitadas.length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-2xl font-bold text-gray-900">
                {s.value}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Gestión de experiencias */}
        {(activeNav === 'experiencias' || activeNav === 'dashboard') && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900">
                {activeNav === 'dashboard' ? 'Experiencias disponibles' : 'Gestión de experiencias'}
              </h2>
              <div className="flex gap-2">
                <select
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                  value={filtroArea}
                  onChange={(e) => setFiltroArea(e.target.value)}
                >
                  <option value="">Todas las áreas</option>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
                <select
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                  value={filtroModalidad}
                  onChange={(e) => setFiltroModalidad(e.target.value)}
                >
                  <option value="">Todas las modalidades</option>
                  {MODALIDADES.map((m) => <option key={m} className="capitalize">{m}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {expFiltradas.map((exp) => (
                <div key={exp.id} className="relative">
                  <ExperienciaCard experiencia={exp} mostrarEstado onClick={setSeleccionada} />
                  {habilitadas.includes(exp.id) && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Habilitada
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generar códigos */}
        {activeNav === 'codigos' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-4">
              Generar códigos de alumno
            </h2>
            <div className="flex gap-3 items-end mb-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Cantidad</label>
                <input
                  type="number"
                  className={`${inputClass} w-32`}
                  value={cantidad}
                  min={1}
                  max={200}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>
              <button
                onClick={handleGenerarCodigos}
                className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700"
              >
                Generar →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-semibold">Código</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Alumno</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Email</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {codigos.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50">
                      <td className="py-2 font-mono text-gray-800">{c.codigo}</td>
                      <td className="py-2 text-gray-600">{c.nombre_alumno ?? '—'}</td>
                      <td className="py-2 text-gray-600">{c.email_alumno ?? '—'}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.usado ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
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
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
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
                className="bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
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
