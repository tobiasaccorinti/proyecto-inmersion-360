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

  /** Recomendaciones personalizadas para un estudiante basadas en su historial */
  async recomendadasParaEstudiante(estudianteId: string, institucionId: string | null) {
    const supabase = getSupabase()

    // Inscripciones con área de la experiencia
    const { data: inscripciones } = await supabase
      .from('inscripciones')
      .select('experiencias(id, area)')
      .eq('estudiante_id', estudianteId)

    const areasConteo: Record<string, number> = {}
    const inscritasIds = new Set<string>()

    for (const i of inscripciones ?? []) {
      const exp = i.experiencias as unknown as { id: string; area: string } | null
      if (!exp) continue
      inscritasIds.add(exp.id)
      areasConteo[exp.area] = (areasConteo[exp.area] ?? 0) + 1
    }

    // Área más frecuente
    const areaFavorita = Object.entries(areasConteo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    if (!areaFavorita) return []

    let query = supabase
      .from('experiencias')
      .select('*')
      .eq('area', areaFavorita)
      .eq('estado', 'publicada')
      .order('fecha', { ascending: true })

    if (institucionId) {
      const { data: habilitadas } = await supabase
        .from('experiencia_instituciones')
        .select('experiencia_id')
        .eq('institucion_id', institucionId)
      const habIds = (habilitadas ?? []).map((h) => h.experiencia_id)
      if (habIds.length > 0) query = query.in('id', habIds)
      else return []
    }

    const { data, error } = await query
    if (error) throw createError(error.message, 500)

    // Excluir ya inscriptas y devolver máximo 6
    return (data ?? []).filter((e) => !inscritasIds.has(e.id)).slice(0, 6)
  },

  /** Actualiza los campos de una experiencia (solo el dueño) */
  async actualizar(id: string, userId: string, dto: Partial<CreateExperienciaDto>) {
    const supabase = getSupabase()
    const { data: exp } = await supabase.from('experiencias').select('creado_por').eq('id', id).single()
    if (!exp || exp.creado_por !== userId) throw createError('No autorizado', 403)

    const { data, error } = await supabase
      .from('experiencias')
      .update(dto)
      .eq('id', id)
      .select()
      .single()
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
