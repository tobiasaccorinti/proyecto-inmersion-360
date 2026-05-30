'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Experiencia = {
  id: string
  titulo: string
  area: string
  modalidad: string
  fecha: string
  cupos_totales: number
  estado: string
  descripcion: string
  duracion_minutos: number
  anios_recomendados: string
}

const AREAS = ['Tecnología', 'Salud', 'Diseño', 'Finanzas', 'Oficios', 'Marketing', 'Derecho', 'Ambiente']
const MODALIDADES = ['virtual', 'presencial', 'hibrida']
const ESTADOS = ['publicada', 'en_vivo', 'grabada', 'cancelada']

export default function DashboardEmpresa() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('experiencias')

  // Form
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [area, setArea] = useState('Tecnología')
  const [modalidad, setModalidad] = useState('virtual')
  const [fecha, setFecha] = useState('')
  const [duracion, setDuracion] = useState(60)
  const [cupos, setCupos] = useState(30)
  const [anios, setAnios] = useState('3ro a 6to año')
  const [urlGrabacion, setUrlGrabacion] = useState('')
  const [creando, setCreando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [successForm, setSuccessForm] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (prof) setProfile(prof)
      await loadExperiencias(user.id)
      setLoading(false)
    }
    load()
  }, [])

  async function loadExperiencias(userId: string) {
    const { data } = await supabase
      .from('experiencias')
      .select('*')
      .eq('creado_por', userId)
      .order('created_at', { ascending: false })
    if (data) setExperiencias(data)
  }

  async function handleCrearExperiencia() {
    if (!titulo || !fecha) {
      setErrorForm('Título y fecha son obligatorios.')
      return
    }

    setCreando(true)
    setErrorForm('')
    setSuccessForm('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('experiencias')
      .insert({
        titulo,
        descripcion,
        area,
        empresa: profile?.full_name || '',
        modalidad,
        fecha,
        duracion_minutos: duracion,
        cupos_totales: cupos,
        anios_recomendados: anios,
        url_grabacion: urlGrabacion || null,
        estado: 'publicada',
        creado_por: user.id,
      })
      .select()
      .single()

    if (error) {
      setErrorForm(error.message)
    } else {
      setSuccessForm('Experiencia creada exitosamente.')
      setExperiencias(prev => [data, ...prev])
      setTitulo('')
      setDescripcion('')
      setFecha('')
      setUrlGrabacion('')
      setCupos(30)
      setDuracion(60)
    }

    setCreando(false)
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
    { id: 'experiencias', label: 'Mis experiencias', icon: '◎' },
    { id: 'crear', label: 'Crear experiencia', icon: '⊕' },
  ]

  const estadoLabel: Record<string, string> = {
    publicada: 'Publicada',
    en_vivo: 'En vivo',
    grabada: 'Grabada',
    cancelada: 'Cancelada',
  }

  const estadoColor: Record<string, string> = {
    publicada: 'bg-indigo-50 text-indigo-600',
    en_vivo: 'bg-green-50 text-green-600',
    grabada: 'bg-purple-50 text-purple-600',
    cancelada: 'bg-red-50 text-red-600',
  }

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
              {profile?.full_name?.charAt(0).toUpperCase() || 'E'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-400">Empresa</p>
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
        <div className="bg-indigo-600 rounded-2xl p-8 mb-6">
          <p className="text-indigo-200 text-sm mb-1">Panel de empresa</p>
          <h1 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-3xl font-bold text-white">
            {profile?.full_name} 🏢
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">Creá experiencias y conectá con estudiantes secundarios.</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">{experiencias.length}</p>
            <p className="text-sm text-gray-400 mt-0.5">Experiencias creadas</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">
              {experiencias.filter(e => e.estado === 'publicada').length}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">Publicadas</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-2xl font-bold text-gray-900">
              {experiencias.reduce((acc, e) => acc + e.cupos_totales, 0)}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">Cupos totales ofrecidos</p>
          </div>
        </div>

        {/* CREAR EXPERIENCIA */}
        {activeNav === 'crear' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg font-bold text-gray-900 mb-6">
              Nueva experiencia
            </h2>

            {errorForm && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {errorForm}
              </div>
            )}
            {successForm && (
              <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
                ✓ {successForm}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Título *</label>
                <input
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ej: Cómo se crea una app desde cero"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Descripción</label>
                <textarea
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400 resize-none"
                  rows={3}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describí de qué se trata la experiencia..."
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Área</label>
                <select
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                >
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Modalidad</label>
                <select
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                  value={modalidad}
                  onChange={e => setModalidad(e.target.value)}
                >
                  {MODALIDADES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Fecha y hora *</label>
                <input
                  type="datetime-local"
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Duración (minutos)</label>
                <input
                  type="number"
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                  value={duracion}
                  onChange={e => setDuracion(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Cupos totales</label>
                <input
                  type="number"
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all"
                  value={cupos}
                  onChange={e => setCupos(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Años recomendados</label>
                <input
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all placeholder-gray-400"
                  value={anios}
                  onChange={e => setAnios(e.target.value)}
                  placeholder="Ej: 3ro a 6to año"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">URL de grabación (opcional)</label>
                <input
                  className="w-full bg-[#EEEFFE] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 transition-all placeholder-gray-400"
                  value={urlGrabacion}
                  onChange={e => setUrlGrabacion(e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="col-span-2 flex justify-end">
                <button
                  onClick={handleCrearExperiencia}
                  disabled={creando}
                  className="bg-indigo-600 text-white font-semibold text-sm px-8 py-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {creando ? 'Publicando...' : 'Publicar experiencia →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MIS EXPERIENCIAS */}
        {activeNav === 'experiencias' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 style={{ fontFamily: "var(--font-heading, sans-serif)" }} className="text-lg font-bold text-gray-900">
                Mis experiencias ({experiencias.length})
              </h2>
              <button
                onClick={() => setActiveNav('crear')}
                className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
              >
                + Crear nueva
              </button>
            </div>

            {experiencias.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm mb-4">Todavía no creaste ninguna experiencia.</p>
                <button
                  onClick={() => setActiveNav('crear')}
                  className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Crear primera experiencia →
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Título</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Área</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Modalidad</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Cupos</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {experiencias.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{e.titulo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{e.anios_recomendados}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{e.area}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{e.modalidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{e.cupos_totales}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoColor[e.estado]}`}>
                          {estadoLabel[e.estado]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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