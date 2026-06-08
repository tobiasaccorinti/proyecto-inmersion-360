'use client'

/**
 * DashboardEmpresaPage — Panel de empresa para gestionar experiencias.
 * Ruta: /dashboard/empresa
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, type NavItem } from '@/components/Sidebar'
import { ExperienciaCard } from '@/components/ExperienciaCard'
import { CrearExperienciaForm } from '@/components/CrearExperienciaForm'
import { experienciasService } from '@/services/experienciasService'
import { authService } from '@/services/authService'
import type { Experiencia, Profile } from '@/types'

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'experiencias', label: 'Mis experiencias', icon: '◎' },
  { id: 'crear', label: 'Crear experiencia', icon: '⊕' },
]

export default function DashboardEmpresaPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem('inspira_token')
      if (!stored) { router.push('/auth/login'); return }
      setToken(stored)
      try {
        const me = await authService.me(stored)
        if (me.role !== 'empresa') { router.push('/dashboard'); return }
        setProfile(me)
        const exps = await experienciasService.listarMias(stored)
        setExperiencias(exps)
      } catch {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

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

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      <Sidebar
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        userName={profile?.full_name ?? ''}
        userRole="Empresa"
        onLogout={handleLogout}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-indigo-600 rounded-2xl p-8 mb-6">
          <p className="text-indigo-200 text-sm mb-1">Panel de empresa</p>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-3xl font-bold text-white">
            {profile?.full_name} 🏢
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">Creá experiencias y conectá con estudiantes secundarios.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Experiencias creadas', value: experiencias.length },
            { label: 'Publicadas', value: experiencias.filter((e) => e.estado === 'publicada').length },
            { label: 'Cupos totales', value: experiencias.reduce((a, e) => a + e.cupos_totales, 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {activeNav === 'crear' && token && (
          <CrearExperienciaForm token={token} onCreated={(n) => setExperiencias((p) => [n, ...p])} />
        )}

        {(activeNav === 'experiencias' || activeNav === 'dashboard') && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-4">
              {activeNav === 'dashboard' ? 'Experiencias recientes' : 'Mis experiencias'}
            </h2>
            {experiencias.length === 0 ? (
              <p className="text-sm text-gray-400">
                Todavía no creaste ninguna experiencia.{' '}
                <button className="text-indigo-600 font-medium hover:underline" onClick={() => setActiveNav('crear')}>
                  Crear la primera →
                </button>
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {experiencias.map((exp) => (
                  <ExperienciaCard key={exp.id} experiencia={exp} mostrarEstado onClick={() => {}} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
