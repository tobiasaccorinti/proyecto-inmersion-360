import { apiRequest } from './api'
import type { Experiencia } from '../types'

export const publicService = {
  /** Obtiene las estadísticas para la landing page */
  async getStats() {
    return apiRequest<{ experiencias: string; estudiantes: string; empresas: string }>('/public/stats')
  },

  /** Lista experiencias públicas sin necesidad de token */
  async listarExperiencias() {
    return apiRequest<Experiencia[]>('/experiencias')
  }
}
