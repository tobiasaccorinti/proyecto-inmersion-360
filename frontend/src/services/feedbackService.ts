import { apiRequest } from './api'
import type { Feedback, FeedbackResumenEmpresa } from '../types'

export const feedbackService = {
  async enviar(token: string, payload: { experiencia_id: string; calificacion: number; comentario?: string }): Promise<Feedback> {
    return apiRequest<Feedback>('/feedback', { method: 'POST', token, body: payload })
  },

  async misFeedbacks(token: string): Promise<Feedback[]> {
    return apiRequest<Feedback[]>('/feedback/mios', { token })
  },

  async resumenEmpresa(token: string): Promise<FeedbackResumenEmpresa[]> {
    return apiRequest<FeedbackResumenEmpresa[]>('/feedback/empresa/resumen', { token })
  },

  async resumenInstitucion(token: string): Promise<Feedback[]> {
    return apiRequest<Feedback[]>('/feedback/institucion/resumen', { token })
  },

  async listarDeExperienciaInstitucion(experienciaId: string, token: string): Promise<Feedback[]> {
    return apiRequest<Feedback[]>(`/feedback/institucion/${experienciaId}`, { token })
  },
}
