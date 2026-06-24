'use client'

/**
 * DashboardPage — Redirección automática al dashboard del rol del usuario.
 * Ruta: /dashboard
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const token = localStorage.getItem('inspira_token')
      if (!token) { router.push('/auth/login'); return }

      try {
        const profile = await authService.me(token)
        if (profile.role === 'estudiante') router.push('/dashboard/estudiante')
        else if (profile.role === 'institucion') router.push('/dashboard/institucion')
        else if (profile.role === 'empresa') router.push('/dashboard/empresa')
        else if (profile.role === 'admin') router.push('/dashboard/admin')
        else router.push('/auth/login')
      } catch {
        localStorage.removeItem('inspira_token')
        router.push('/auth/login')
      }
    }
    redirect()
  }, [router])

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )
}
