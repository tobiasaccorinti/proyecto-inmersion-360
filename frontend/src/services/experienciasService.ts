/**
 * Servicio de experiencias del frontend.
 * Consume los endpoints /api/experiencias/* del backend.
 */

import { apiRequest } from './api'
import type { Experiencia } from '../types'

export interface CrearExperienciaPayload {
  titulo: string
  descripcion: string
  area: string
  modalidad: 'virtual' | 'presencial' | 'hibrida'
  fecha: string
  duracion_minutos: number
  cupos_totales: number
  anios_recomendados: string
  url_grabacion?: string
}

export const experienciasService = {
  /** Lista experiencias con filtros opcionales */
  async listar(
    filters: { area?: string; estado?: string; institucion_id?: string } = {},
    token?: string | null
  ): Promise<Experiencia[]> {
    const params = new URLSearchParams()
    if (filters.area) params.set('area', filters.area)
    if (filters.estado) params.set('estado', filters.estado)
    if (filters.institucion_id) params.set('institucion_id', filters.institucion_id)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<Experiencia[]>(`/experiencias${qs}`, { token })
  },

  /** Obtiene el detalle de una experiencia */
  async obtener(id: string): Promise<Experiencia> {
    return apiRequest<Experiencia>(`/experiencias/${id}`)
  },

  /** Crea una experiencia (rol empresa) */
  async crear(payload: CrearExperienciaPayload, token: string): Promise<Experiencia> {
    return apiRequest<Experiencia>('/experiencias', { method: 'POST', body: payload, token })
  },

  /** Lista las experiencias propias (empresa) */
  async listarMias(token: string): Promise<Experiencia[]> {
    return apiRequest<Experiencia[]>('/experiencias/mias', { token })
  },

  /** Experiencias recomendadas para el estudiante basadas en su historial */
  async recomendadasParaMi(token: string): Promise<Experiencia[]> {
    return apiRequest<Experiencia[]>('/experiencias/recomendadas/para-mi', { token })
  },

  /** Actualiza los campos de una experiencia */
  async actualizar(id: string, payload: Partial<CrearExperienciaPayload>, token: string): Promise<Experiencia> {
    return apiRequest<Experiencia>(`/experiencias/${id}`, { method: 'PUT', body: payload, token })
  },

  /** Cambia el estado de una experiencia */
  async actualizarEstado(
    id: string,
    estado: Experiencia['estado'],
    token: string
  ): Promise<Experiencia> {
    return apiRequest<Experiencia>(`/experiencias/${id}/estado`, {
      method: 'PATCH',
      body: { estado },
      token,
    })
  },
}
