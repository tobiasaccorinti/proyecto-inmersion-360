'use client'

/**
 * Contexto global de autenticación.
 * Provee: usuario actual, perfil, estado de carga y función de logout.
 *
 * Usa el backend propio (JWT) para obtener el perfil, con fallback
 * a Supabase para la sesión de Auth.
 */

import React, { createContext, useEffect, useState } from 'react'
import type { Profile } from '../types'
import { authService } from '../services/authService'

interface AuthContextValue {
  profile: Profile | null
  loading: boolean
  token: string | null
  logout: () => void
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshProfile() {
    const storedToken = localStorage.getItem('inspira_token')
    if (!storedToken) {
      setLoading(false)
      return
    }
    setToken(storedToken)
    try {
      const me = await authService.me(storedToken)
      setProfile(me)
    } catch {
      // Token inválido o expirado — limpiar sesión
      localStorage.removeItem('inspira_token')
      setToken(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  function logout() {
    localStorage.removeItem('inspira_token')
    setToken(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ profile, loading, token, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
