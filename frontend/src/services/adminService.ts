/**
 * Servicio de administración del frontend.
 * Consume los endpoints /api/admin/* del backend.
 */

import { apiRequest } from './api'
import type { Profile } from '../types'

export const adminService = {
  async listarEmpresas(token: string): Promise<Profile[]> {
    return apiRequest<Profile[]>('/admin/empresas', { token })
  },

  async aprobarEmpresa(token: string, empresaId: string): Promise<Profile> {
    return apiRequest<Profile>(`/admin/empresas/${empresaId}/aprobar`, {
      method: 'PATCH',
      token,
    })
  },

  async rechazarEmpresa(token: string, empresaId: string, notas?: string): Promise<Profile> {
    return apiRequest<Profile>(`/admin/empresas/${empresaId}/rechazar`, {
      method: 'PATCH',
      token,
      body: { notas },
    })
  },
}
