/**
 * Servicio de inscripciones.
 * Gestiona la inscripción de alumnos a experiencias.
 */

import { getSupabase } from '../config/database'
import { createError } from '../middleware/errorHandler'

export const inscripcionesService = {
  /** Inscribe a un alumno en una experiencia */
  async inscribir(estudianteId: string, experienciaId: string) {
    const supabase = getSupabase()

    // Verificar que no está ya inscripto
    const { data: existente } = await supabase
      .from('inscripciones')
      .select('id')
      .eq('estudiante_id', estudianteId)
      .eq('experiencia_id', experienciaId)
      .maybeSingle()

    if (existente) throw createError('Ya estás inscripto en esta experiencia', 409)

    const { data, error } = await supabase
      .from('inscripciones')
      .insert({ estudiante_id: estudianteId, experiencia_id: experienciaId })
      .select()
      .single()

    if (error) throw createError(error.message, 500)
    return data
  },

  /** Lista las inscripciones de un alumno con detalle de experiencias */
  async listarDeAlumno(estudianteId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('inscripciones')
      .select('*, experiencias(*)')
      .eq('estudiante_id', estudianteId)
      .order('created_at', { ascending: false })
    if (error) throw createError(error.message, 500)
    return data
  },

  /** Cancela una inscripción */
  async cancelar(estudianteId: string, inscripcionId: string) {
    const supabase = getSupabase()
    const { data: ins } = await supabase
      .from('inscripciones')
      .select('estudiante_id')
      .eq('id', inscripcionId)
      .single()

    if (!ins || ins.estudiante_id !== estudianteId) throw createError('No autorizado', 403)

    const { error } = await supabase.from('inscripciones').delete().eq('id', inscripcionId)
    if (error) throw createError(error.message, 500)
  },

  /** Lista inscripciones de una experiencia (para la empresa) */
  async listarDeExperiencia(experienciaId: string, userId: string) {
    const supabase = getSupabase()
    // Verificar que la experiencia pertenece a esta empresa
    const { data: exp } = await supabase
      .from('experiencias')
      .select('creado_por')
      .eq('id', experienciaId)
      .single()
    if (!exp || exp.creado_por !== userId) throw createError('No autorizado', 403)

    const { data, error } = await supabase
      .from('inscripciones')
      .select('*, profiles(full_name)')
      .eq('experiencia_id', experienciaId)
    if (error) throw createError(error.message, 500)
    return data
  },
}
