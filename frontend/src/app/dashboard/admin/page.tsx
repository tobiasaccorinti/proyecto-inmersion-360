'use client'

/**
 * DashboardAdminPage — Panel de administración para validar empresas.
 * Ruta: /dashboard/admin
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { adminService } from '@/services/adminService'
import type { Profile, ValidacionEstado } from '@/types'

const ESTADO_LABEL: Record<ValidacionEstado, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

const ESTADO_CLASS: Record<ValidacionEstado, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
}

type FilterTab = 'todas' | ValidacionEstado

function EmpresaCard({
  empresa,
  onAprobar,
  onRechazar,
}: {
  empresa: Profile
  onAprobar: (id: string) => void
  onRechazar: (id: string) => void
}) {
  const estado = (empresa.validacion_estado ?? 'pendiente') as ValidacionEstado

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{empresa.full_name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Registrada: {empresa.created_at ? new Date(empresa.created_at).toLocaleDateString('es-AR') : '—'}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${ESTADO_CLASS[estado]}`}>
          {ESTADO_LABEL[estado]}
        </span>
      </div>

      {empresa.documento_url ? (
        <a
          href={empresa.documento_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-3 underline underline-offset-2"
        >
          📄 Ver documento de verificación
        </a>
      ) : (
        <p className="text-xs text-gray-300 mb-3 italic">Sin documento adjunto</p>
      )}

      {empresa.validacion_notas && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3 italic">
          Nota: &ldquo;{empresa.validacion_notas}&rdquo;
        </p>
      )}

      {estado === 'pendiente' && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onAprobar(empresa.id)}
            className="flex-1 bg-green-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-green-700 transition-colors"
          >
            ✓ Aprobar
          </button>
          <button
            onClick={() => onRechazar(empresa.id)}
            className="flex-1 bg-red-50 text-red-600 text-sm font-semibold py-2 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
          >
            ✕ Rechazar
          </button>
        </div>
      )}
    </div>
  )
}

function RechazarModal({
  empresaId,
  onConfirm,
  onCancel,
}: {
  empresaId: string
  onConfirm: (id: string, notas: string) => void
  onCancel: () => void
}) {
  const [notas, setNotas] = useState('')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Rechazar empresa</h2>
        <p className="text-sm text-gray-500 mb-4">Podés agregar una nota opcional para informarle a la empresa el motivo del rechazo.</p>
        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
          rows={3}
          placeholder="Ej: La documentación presentada no es válida..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onConfirm(empresaId, notas)}
            className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm"
          >
            Confirmar rechazo
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardAdminPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [empresas, setEmpresas] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('pendiente')
  const [rechazandoId, setRechazandoId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem('inspira_token')
      if (!stored) { router.push('/auth/login'); return }
      setToken(stored)
      try {
        const me = await authService.me(stored)
        if (me.role !== 'admin') { router.push('/dashboard'); return }
        const data = await adminService.listarEmpresas(stored)
        setEmpresas(data)
      } catch {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  async function handleAprobar(id: string) {
    if (!token || actionLoading) return
    setActionLoading(true)
    try {
      const updated = await adminService.aprobarEmpresa(token, id)
      setEmpresas((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRechazar(id: string, notas: string) {
    if (!token || actionLoading) return
    setActionLoading(true)
    try {
      const updated = await adminService.rechazarEmpresa(token, id, notas)
      setEmpresas((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setActionLoading(false)
      setRechazandoId(null)
    }
  }

  function handleLogout() {
    localStorage.removeItem('inspira_token')
    router.push('/auth/login')
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'pendiente', label: `Pendientes (${empresas.filter((e) => (e.validacion_estado ?? 'pendiente') === 'pendiente').length})` },
    { key: 'aprobada', label: `Aprobadas (${empresas.filter((e) => e.validacion_estado === 'aprobada').length})` },
    { key: 'rechazada', label: `Rechazadas (${empresas.filter((e) => e.validacion_estado === 'rechazada').length})` },
    { key: 'todas', label: `Todas (${empresas.length})` },
  ]

  const empresasFiltradas = activeTab === 'todas'
    ? empresas
    : empresas.filter((e) => (e.validacion_estado ?? 'pendiente') === activeTab)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEEFFE] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EEEFFE]" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {rechazandoId && (
        <RechazarModal
          empresaId={rechazandoId}
          onConfirm={handleRechazar}
          onCancel={() => setRechazandoId(null)}
        />
      )}

      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Panel Admin</span>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-xl font-bold text-gray-900">
            Inspira — Administración
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="bg-indigo-600 rounded-2xl p-6 mb-8 shadow-lg shadow-indigo-100">
          <p className="text-indigo-200 text-sm mb-1 uppercase font-bold tracking-wider">Validación de empresas</p>
          <p className="text-white text-sm mt-1">
            Revisá la documentación de cada empresa y aprobá o rechazá su acceso a publicar experiencias.
          </p>
        </div>

        {/* Tabs de filtro */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {empresasFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm">No hay empresas en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresasFiltradas.map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                onAprobar={handleAprobar}
                onRechazar={(id) => setRechazandoId(id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
