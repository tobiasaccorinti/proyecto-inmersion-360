/**
 * Servicio de instituciones.
 * Gestiona datos de institución, habilitación de experiencias y alumnos.
 */

import { getSupabase } from '../config/database'
import { createError } from '../middleware/errorHandler'
import { generarPrefijoInstitucion } from '../utils/codigos'
import type { HabilitarExperienciaDto, AgregarAlumnoDto } from '../models/types'

export const institucionesService = {
  /** Crea una nueva institución vinculada a un usuario */
  async crear(userId: string, nombre: string) {
    const supabase = getSupabase()
    const prefijo = generarPrefijoInstitucion(nombre)

    const { data, error } = await supabase
      .from('instituciones')
      .insert({ nombre, prefijo, creado_por: userId })
      .select()
      .single()

    if (error) throw createError(error.message, 500)
    return data
  },

  /** Obtiene la institución del usuario autenticado */
  async obtenerMia(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .eq('creado_por', userId)
      .single()
    if (error || !data) throw createError('Institución no encontrada', 404)
    return data
  },

  /** Lista los alumnos de una institución */
  async listarAlumnos(institucionId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at, codigos_alumno(codigo)')
      .eq('institucion_id', institucionId)
      .eq('role', 'estudiante')
    if (error) throw createError(error.message, 500)
    return data
  },

  /** Habilita una experiencia para la institución con un cupo reservado */
  async habilitarExperiencia(institucionId: string, dto: HabilitarExperienciaDto) {
    const supabase = getSupabase()

    // Verificar que la experiencia existe y tiene cupos suficientes
    const { data: exp } = await supabase
      .from('experiencias')
      .select('cupos_totales, id')
      .eq('id', dto.experiencia_id)
      .single()
    if (!exp) throw createError('Experiencia no encontrada', 404)

    const { data: existing } = await supabase
      .from('experiencia_instituciones')
      .select('cupos_reservados')
      .eq('experiencia_id', dto.experiencia_id)

    const yaReservados = (existing ?? []).reduce((acc, r) => acc + r.cupos_reservados, 0)
    if (yaReservados + dto.cupos_reservados > exp.cupos_totales) {
      throw createError('No hay suficientes cupos disponibles para esta experiencia', 400)
    }

    const { data, error } = await supabase
      .from('experiencia_instituciones')
      .upsert({ experiencia_id: dto.experiencia_id, institucion_id: institucionId, cupos_reservados: dto.cupos_reservados })
      .select()
      .single()
    if (error) throw createError(error.message, 500)
    return data
  },

  /** Deshabilita una experiencia para la institución */
  async deshabilitarExperiencia(institucionId: string, experienciaId: string) {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('experiencia_instituciones')
      .delete()
      .eq('experiencia_id', experienciaId)
      .eq('institucion_id', institucionId)
    if (error) throw createError(error.message, 500)
  },

  /** Lista las experiencias habilitadas por la institución */
  async listarExperienciasHabilitadas(institucionId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('experiencia_instituciones')
      .select('cupos_reservados, experiencias(*)')
      .eq('institucion_id', institucionId)
    if (error) throw createError(error.message, 500)
    return data
  },

  /** Agrega un alumno manualmente (pre-carga con código asignado) */
  async agregarAlumno(institucionId: string, prefijo: string, dto: AgregarAlumnoDto) {
    const supabase = getSupabase()
    const { generarCodigoAlumno } = await import('../utils/codigos')
    const codigo = generarCodigoAlumno(prefijo)

    const { data, error } = await supabase
      .from('codigos_alumno')
      .insert({
        codigo,
        usado: false,
        nombre_alumno: dto.nombre,
        email_alumno: dto.email,
        institucion_id: institucionId,
      })
      .select()
      .single()
    if (error) throw createError(error.message, 500)
    return data
  },
}
