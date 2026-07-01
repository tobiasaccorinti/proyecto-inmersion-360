/**
 * Servicio de feedback.
 * Gestiona las reseñas de estudiantes sobre experiencias finalizadas.
 */

import { getSupabase } from '../config/database'
import { createError } from '../middleware/errorHandler'
import type { CreateFeedbackDto } from '../models/types'

export const feedbackService = {
  /** Envía feedback de un estudiante sobre una experiencia */
  async enviar(estudianteId: string, dto: CreateFeedbackDto) {
    const supabase = getSupabase()

    // Verificar que el estudiante está inscripto
    const { data: inscripcion } = await supabase
      .from('inscripciones')
      .select('id')
      .eq('estudiante_id', estudianteId)
      .eq('experiencia_id', dto.experiencia_id)
      .maybeSingle()

    if (!inscripcion) throw createError('No estás inscripto en esta experiencia', 403)

    // Verificar que la experiencia ya pasó
    const { data: exp } = await supabase
      .from('experiencias')
      .select('fecha')
      .eq('id', dto.experiencia_id)
      .single()

    if (!exp) throw createError('Experiencia no encontrada', 404)
    if (new Date(exp.fecha) > new Date()) throw createError('La experiencia aún no finalizó', 400)

    // Verificar que no haya feedback previo
    const { data: existente } = await supabase
      .from('feedbacks')
      .select('id')
      .eq('estudiante_id', estudianteId)
      .eq('experiencia_id', dto.experiencia_id)
      .maybeSingle()

    if (existente) throw createError('Ya dejaste feedback para esta experiencia', 409)

    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        estudiante_id: estudianteId,
        experiencia_id: dto.experiencia_id,
        calificacion: dto.calificacion,
        comentario: dto.comentario ?? null,
      })
      .select()
      .single()

    if (error) throw createError(error.message, 500)
    return data
  },

  /** Devuelve feedbacks de una experiencia (para la empresa dueña) */
  async listarDeExperiencia(experienciaId: string, empresaId: string) {
    const supabase = getSupabase()

    const { data: exp } = await supabase
      .from('experiencias')
      .select('creado_por, titulo')
      .eq('id', experienciaId)
      .single()

    if (!exp || exp.creado_por !== empresaId) throw createError('No autorizado', 403)

    const { data, error } = await supabase
      .from('feedbacks')
      .select('*, profiles(full_name)')
      .eq('experiencia_id', experienciaId)
      .order('created_at', { ascending: false })

    if (error) throw createError(error.message, 500)
    return data ?? []
  },

  /** Devuelve feedbacks de una experiencia para una institución (sin verificar ownership) */
  async listarDeExperienciaInstitucion(experienciaId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*, profiles(full_name)')
      .eq('experiencia_id', experienciaId)
      .order('created_at', { ascending: false })
    if (error) throw createError(error.message, 500)
    return data ?? []
  },

  /** Devuelve resumen de feedback de todas las experiencias de una empresa */
  async resumenDeEmpresa(empresaId: string) {
    const supabase = getSupabase()

    const { data: exps } = await supabase
      .from('experiencias')
      .select('id, titulo, area, fecha')
      .eq('creado_por', empresaId)

    if (!exps || exps.length === 0) return []

    const ids = exps.map((e) => e.id)

    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select('experiencia_id, calificacion, comentario, created_at, profiles(full_name)')
      .in('experiencia_id', ids)

    if (error) throw createError(error.message, 500)

    return exps.map((exp) => {
      const fb = (feedbacks ?? []).filter((f) => f.experiencia_id === exp.id)
      const promedio = fb.length > 0
        ? Math.round((fb.reduce((acc, f) => acc + f.calificacion, 0) / fb.length) * 10) / 10
        : null
      return { ...exp, feedbacks: fb, promedio, total_feedbacks: fb.length }
    })
  },

  /** Devuelve feedbacks de experiencias de los alumnos de una institución */
  async resumenDeInstitucion(userId: string) {
    const supabase = getSupabase()

    // Resolver el ID real de la institución a partir del usuario
    const { data: inst } = await supabase
      .from('instituciones')
      .select('id')
      .eq('creado_por', userId)
      .single()

    if (!inst) return []

    // Alumnos de la institución
    const { data: alumnos } = await supabase
      .from('profiles')
      .select('id')
      .eq('institucion_id', inst.id)
      .eq('role', 'estudiante')

    if (!alumnos || alumnos.length === 0) return []

    const alumnoIds = alumnos.map((a) => a.id)

    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select('*, experiencias(titulo, area, empresa, fecha), profiles(full_name)')
      .in('estudiante_id', alumnoIds)
      .order('created_at', { ascending: false })

    if (error) throw createError(error.message, 500)
    return feedbacks ?? []
  },

  /** Feedbacks del estudiante (para saber cuáles ya dejó) */
  async misFeeedbacks(estudianteId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('feedbacks')
      .select('experiencia_id, calificacion, comentario')
      .eq('estudiante_id', estudianteId)
    if (error) throw createError(error.message, 500)
    return data ?? []
  },
}
