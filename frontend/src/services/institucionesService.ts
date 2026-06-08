/**
 * Servicio de instituciones del frontend.
 * Consume los endpoints /api/instituciones/* y /api/codigos/* del backend.
 */

import { apiRequest } from './api'
import type { Institucion, CodigoAlumno, ExperienciaInstitucion } from '../types'

export interface AgregarAlumnoPayload {
  nombre: string
  email: string
}

export interface HabilitarExperienciaPayload {
  experiencia_id: string
  cupos_reservados: number
}

export const institucionesService = {
  /** Obtiene los datos de mi institución */
  async obtenerMia(token: string): Promise<Institucion> {
    return apiRequest<Institucion>('/instituciones/mia', { token })
  },

  /** Lista los alumnos de la institución */
  async listarAlumnos(token: string) {
    return apiRequest<unknown[]>('/instituciones/mia/alumnos', { token })
  },

  /** Agrega un alumno con código asignado */
  async agregarAlumno(payload: AgregarAlumnoPayload, token: string): Promise<CodigoAlumno> {
    return apiRequest<CodigoAlumno>('/instituciones/mia/alumnos', { method: 'POST', body: payload, token })
  },

  /** Lista las experiencias habilitadas por la institución */
  async listarExperienciasHabilitadas(token: string): Promise<ExperienciaInstitucion[]> {
    return apiRequest<ExperienciaInstitucion[]>('/instituciones/mia/experiencias', { token })
  },

  /** Habilita una experiencia para la institución */
  async habilitarExperiencia(payload: HabilitarExperienciaPayload, token: string) {
    return apiRequest('/instituciones/mia/experiencias', { method: 'POST', body: payload, token })
  },

  /** Deshabilita una experiencia */
  async deshabilitarExperiencia(experienciaId: string, token: string): Promise<void> {
    return apiRequest<void>(`/instituciones/mia/experiencias/${experienciaId}`, { method: 'DELETE', token })
  },

  /** Genera N códigos de alumno */
  async generarCodigos(cantidad: number, token: string): Promise<CodigoAlumno[]> {
    return apiRequest<CodigoAlumno[]>('/codigos/generar', { method: 'POST', body: { cantidad }, token })
  },

  /** Lista los códigos de alumno de la institución */
  async listarCodigos(token: string): Promise<CodigoAlumno[]> {
    return apiRequest<CodigoAlumno[]>('/codigos', { token })
  },
}
