/**
 * Servicio de experiencias.
 * Gestiona la creación, consulta y actualización de experiencias (charlas/talleres).
 */

import { getSupabase } from '../config/database'
import { createError } from '../middleware/errorHandler'
import type { CreateExperienciaDto } from '../models/types'

export const experienciasService = {
  /** Lista todas las experiencias (admins) o filtradas por institución/área */
  async listar(filters: { institucionId?: string; area?: string; estado?: string }) {
    const supabase = getSupabase()
    let query = supabase.from('experiencias').select('*').order('fecha', { ascending: true })

    if (filters.area) query = query.eq('area', filters.area)
    if (filters.estado) query = query.eq('estado', filters.estado)

    if (filters.institucionId) {
      // Solo experiencias habilitadas por esa institución
      const { data: habilitadas } = await supabase
        .from('experiencia_instituciones')
        .select('experiencia_id')
        .eq('institucion_id', filters.institucionId)

      const ids = (habilitadas ?? []).map((h) => h.experiencia_id)
      if (ids.length === 0) return []
      query = query.in('id', ids)
    }

    const { data, error } = await query
    if (error) throw createError(error.message, 500)
    return data
  },

  /** Obtiene una experiencia por ID */
  async obtener(id: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('experiencias').select('*').eq('id', id).single()
    if (error || !data) throw createError('Experiencia no encontrada', 404)
    return data
  },

  /** Crea una nueva experiencia. Solo accesible para el rol `empresa`. */
  async crear(userId: string, empresaNombre: string, dto: CreateExperienciaDto) {
    const supabase = getSupabase()
    
    // Aseguramos que los campos coincidan con la DB
    const insertData = {
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      area: dto.area,
      modalidad: dto.modalidad,
      fecha: dto.fecha,
      duracion_minutos: dto.duracion_minutos,
      cupos_totales: dto.cupos_totales,
      anios_recomendados: dto.anios_recomendados,
      url_grabacion: dto.url_grabacion,
      empresa: empresaNombre,
      estado: 'publicada',
      creado_por: userId,
    }

    const { data, error } = await supabase
      .from('experiencias')
      .insert(insertData)
      .select()
      .single()

    if (error || !data) throw createError(error?.message ?? 'Error al crear experiencia', 500)
    return data
  },

  /** Lista experiencias creadas por una empresa específica */
  async listarDeEmpresa(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('experiencias')
      .select('*')
      .eq('creado_por', userId)
      .order('created_at', { ascending: false })
    if (error) throw createError(error.message, 500)
    return data
  },

  /** Actualiza el estado de una experiencia */
  async actualizarEstado(id: string, userId: string, estado: string) {
    const supabase = getSupabase()
    const { data: exp } = await supabase.from('experiencias').select('creado_por').eq('id', id).single()
    if (!exp || exp.creado_por !== userId) throw createError('No autorizado', 403)

    const { data, error } = await supabase
      .from('experiencias')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()
    if (error) throw createError(error.message, 500)
    return data
  },
}
