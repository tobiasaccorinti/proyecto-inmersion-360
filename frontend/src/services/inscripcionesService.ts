/**
 * Servicio de inscripciones del frontend.
 * Consume los endpoints /api/inscripciones/* del backend.
 */

import { apiRequest } from './api'
import type { Inscripcion } from '../types'

export const inscripcionesService = {
  /** Lista las inscripciones del alumno autenticado */
  async listarMias(token: string): Promise<Inscripcion[]> {
    return apiRequest<Inscripcion[]>('/inscripciones/mias', { token })
  },

  /** Inscribe al alumno en una experiencia */
  async inscribir(experienciaId: string, token: string): Promise<Inscripcion> {
    return apiRequest<Inscripcion>(`/inscripciones/${experienciaId}`, { method: 'POST', token })
  },

  /** Cancela una inscripción */
  async cancelar(inscripcionId: string, token: string): Promise<void> {
    return apiRequest<void>(`/inscripciones/${inscripcionId}`, { method: 'DELETE', token })
  },
}
