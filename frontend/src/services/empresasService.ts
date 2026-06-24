import { apiRequest } from './api'
import type { ReputacionEmpresa, MiReputacion } from '../types'

export const empresasService = {
  async listarReputaciones(token: string): Promise<ReputacionEmpresa[]> {
    return apiRequest<ReputacionEmpresa[]>('/empresas/reputaciones', { token })
  },

  async miReputacion(token: string): Promise<MiReputacion> {
    return apiRequest<MiReputacion>('/empresas/mi-reputacion', { token })
  },
}
