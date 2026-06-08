/**
 * Servicio de autenticación del frontend.
 * Consume los endpoints /api/auth/* del backend.
 */

import { apiRequest } from './api'
import type { Profile, Role } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  role: Role
  codigoAlumno?: string
  nombreInstitucion?: string
}

export interface AuthResponse {
  token: string
  role: Role
}

export interface LoginResponse {
  token: string
  profile: Profile
}

export const authService = {
  /** Registra un nuevo usuario y devuelve el token JWT */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: payload })
  },

  /** Inicia sesión y devuelve el token JWT + perfil */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: payload })
  },

  /** Obtiene el perfil del usuario autenticado */
  async me(token: string): Promise<Profile> {
    return apiRequest<Profile>('/auth/me', { token })
  },
}
