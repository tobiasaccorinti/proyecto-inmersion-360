'use client'

/**
 * Hook personalizado para acceder al usuario autenticado y su perfil.
 * Lee desde el AuthContext global.
 */

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
