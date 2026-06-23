'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function redirect() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) { router.push('/auth/login'); return }

      if (profile.role === 'estudiante') router.push('/dashboard/estudiante')
      if (profile.role === 'institucion') router.push('/dashboard/institucion')
      if (profile.role === 'empresa') router.push('/dashboard/empresa')
    }
    redirect()
  }, [])

  return (
    <div className="min-h-screen bg-[#EEEFFE] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )
}