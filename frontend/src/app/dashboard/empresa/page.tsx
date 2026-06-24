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
import { feedbackService } from '@/services/feedbackService'
import { empresasService } from '@/services/empresasService'
import { authService } from '@/services/authService'
import type { Experiencia, Profile, FeedbackResumenEmpresa } from '@/types'

const NAV_ITEMS_APROBADA: NavItem[] = [
  { id: 'experiencias', label: 'Mis experiencias', icon: '◎' },
  { id: 'crear', label: 'Crear experiencia', icon: '⊕' },
  { id: 'feedback', label: 'Feedback', icon: '⭐' },
]

const NAV_ITEMS_PENDIENTE: NavItem[] = [
  { id: 'experiencias', label: 'Mis experiencias', icon: '◎' },
]

function ValidacionBanner({ profile }: { profile: Profile }) {
  if (profile.validacion_estado === 'aprobada') return null

  if (profile.validacion_estado === 'rechazada') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex gap-3">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-red-700 text-sm">Cuenta rechazada</p>
          <p className="text-red-600 text-sm mt-0.5">
            Tu empresa no fue aprobada por el administrador.
            {profile.validacion_notas && (
              <span className="block mt-1 italic">&ldquo;{profile.validacion_notas}&rdquo;</span>
            )}
          </p>
        </div>
      </div>
    )
  }

  // pendiente
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
      <span className="text-2xl">⏳</span>
      <div>
        <p className="font-semibold text-amber-700 text-sm">Cuenta pendiente de validación</p>
        <p className="text-amber-600 text-sm mt-0.5">
          Un administrador está revisando tu empresa. Una vez aprobada podrás publicar experiencias.
          {profile.documento_url && (
            <a
              href={profile.documento_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-amber-700 underline mt-1 text-xs"
            >
              Ver documento enviado →
            </a>
          )}
        </p>
      </div>
    </div>
  )
}

export default function DashboardEmpresaPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [feedbackResumen, setFeedbackResumen] = useState<FeedbackResumenEmpresa[]>([])
  const [miReputacion, setMiReputacion] = useState<import('@/types').MiReputacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('experiencias')
  const [token, setToken] = useState<string | null>(null)

  const isAprobada = profile?.validacion_estado === 'aprobada'
  const navItems = isAprobada ? NAV_ITEMS_APROBADA : NAV_ITEMS_PENDIENTE

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem('inspira_token')
      if (!stored) { router.push('/auth/login'); return }
      setToken(stored)
      try {
        const me = await authService.me(stored)
        if (me.role !== 'empresa') { router.push('/dashboard'); return }
        setProfile(me)
        if (me.validacion_estado === 'aprobada') {
          const [exps, fbResumen, rep] = await Promise.all([
            experienciasService.listarMias(stored),
            feedbackService.resumenEmpresa(stored),
            empresasService.miReputacion(stored).catch(() => null),
          ])
          setExperiencias(exps)
          setFeedbackResumen(fbResumen)
          setMiReputacion(rep)
        }
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
    <div className="min-h-screen bg-[#EEEFFE] flex flex-col md:flex-row" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      <Sidebar
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        userName={profile?.full_name ?? ''}
        userRole="Empresa"
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="bg-indigo-600 rounded-2xl p-6 md:p-8 mb-6 shadow-lg shadow-indigo-100">
          <p className="text-indigo-200 text-xs md:text-sm mb-1 uppercase font-bold tracking-wider">Panel de empresa</p>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-2xl md:text-3xl font-bold text-white truncate">
            {profile?.full_name} 🏢
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">Creá experiencias y conectá con estudiantes secundarios.</p>
        </div>

        {profile && <ValidacionBanner profile={profile} />}

        {isAprobada && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Experiencias creadas', value: experiencias.length },
              { label: 'Publicadas', value: experiencias.filter((e) => e.estado === 'publicada').length },
              { label: 'Cupos totales', value: experiencias.reduce((a, e) => a + e.cupos_totales, 0) },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center sm:text-left">
                <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-xl md:text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs md:text-sm text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center sm:text-left">
              {miReputacion && miReputacion.total_feedbacks > 0 ? (
                <>
                  <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-xl md:text-2xl font-bold text-amber-500">
                    {miReputacion.promedio} ★
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 mt-0.5">{miReputacion.total_feedbacks} reseña{miReputacion.total_feedbacks !== 1 ? 's' : ''}</p>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-xl md:text-2xl font-bold text-blue-400">✨</p>
                  <p className="text-xs md:text-sm text-gray-400 mt-0.5">Sin reseñas aún</p>
                </>
              )}
            </div>
          </div>
        )}

        {isAprobada && activeNav === 'crear' && token && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <CrearExperienciaForm token={token} onCreated={(n) => {
              setExperiencias((p) => [n, ...p]);
              setActiveNav('experiencias');
            }} />
          </div>
        )}

        {isAprobada && activeNav === 'feedback' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-6">
              Feedback de tus experiencias
            </h2>
            {feedbackResumen.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no hay experiencias con feedback.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {feedbackResumen.map((exp) => (
                  <div key={exp.id} className="border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{exp.titulo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{exp.area} · {new Date(exp.fecha).toLocaleDateString('es-AR')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {exp.promedio !== null ? (
                          <>
                            <p className="text-2xl font-bold text-amber-500">{exp.promedio}</p>
                            <p className="text-xs text-gray-400">{exp.total_feedbacks} reseña{exp.total_feedbacks !== 1 ? 's' : ''}</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-300 italic">Sin reseñas</p>
                        )}
                      </div>
                    </div>
                    {exp.feedbacks.length > 0 && (
                      <div className="flex flex-col gap-2 mt-3 border-t border-gray-50 pt-3">
                        {exp.feedbacks.map((fb, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-600">{fb.profiles?.full_name ?? 'Estudiante'}</span>
                              <div className="flex gap-0.5 ml-auto">
                                {[1,2,3,4,5].map((n) => (
                                  <span key={n} className={`text-xs ${n <= fb.calificacion ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                ))}
                              </div>
                            </div>
                            {fb.comentario && <p className="text-xs text-gray-500 italic">&ldquo;{fb.comentario}&rdquo;</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeNav === 'experiencias' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900 mb-6">
              Mis experiencias
            </h2>
            {!isAprobada ? (
              <p className="text-sm text-gray-400">
                Podrás ver y crear experiencias una vez que tu cuenta sea aprobada.
              </p>
            ) : experiencias.length === 0 ? (
              <p className="text-sm text-gray-400">
                Todavía no creaste ninguna experiencia.{' '}
                <button className="text-indigo-600 font-semibold hover:underline" onClick={() => setActiveNav('crear')}>
                  Crear la primera →
                </button>
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
