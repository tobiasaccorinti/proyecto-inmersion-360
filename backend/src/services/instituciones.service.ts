/**
 * Servicio de instituciones.
 * Gestiona datos de institución, habilitación de experiencias y alumnos.
 */

import { getSupabase } from '../config/database'
import { createError } from '../middleware/errorHandler'
import { generarPrefijoInstitucion } from '../utils/codigos'
import type { HabilitarExperienciaDto, AgregarAlumnoDto, TipoInstitucion } from '../models/types'

const AREAS_POR_TIPO: Record<TipoInstitucion, string[]> = {
  técnica:     ['Tecnología', 'Oficios'],
  comercial:   ['Finanzas', 'Marketing'],
  artística:   ['Diseño', 'Marketing'],
  humanística: ['Derecho', 'Ambiente'],
  científica:  ['Salud', 'Tecnología', 'Ambiente'],
  general:     ['Tecnología', 'Salud', 'Diseño', 'Finanzas', 'Oficios', 'Marketing', 'Derecho', 'Ambiente'],
}

export const institucionesService = {
  /** Crea una nueva institución vinculada a un usuario */
  async crear(userId: string, nombre: string, tipo: TipoInstitucion = 'general') {
    const supabase = getSupabase()
    const prefijo = generarPrefijoInstitucion(nombre)

    const { data, error } = await supabase
      .from('instituciones')
      .insert({ nombre, prefijo, tipo, creado_por: userId })
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
      .upsert(
        { experiencia_id: dto.experiencia_id, institucion_id: institucionId, cupos_reservados: dto.cupos_reservados },
        { onConflict: 'experiencia_id,institucion_id' }
      )
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

  /** Devuelve experiencias recomendadas según el tipo de institución */
  async recomendaciones(userId: string) {
    const supabase = getSupabase()

    const { data: inst } = await supabase
      .from('instituciones')
      .select('id, tipo')
      .eq('creado_por', userId)
      .single()

    if (!inst) return []

    const tipo = (inst.tipo ?? 'general') as TipoInstitucion
    const areas = AREAS_POR_TIPO[tipo] ?? AREAS_POR_TIPO.general

    // Experiencias ya habilitadas por esta institución
    const { data: habilitadas } = await supabase
      .from('experiencia_instituciones')
      .select('experiencia_id')
      .eq('institucion_id', inst.id)

    const habilitadasIds = new Set((habilitadas ?? []).map((h) => h.experiencia_id))

    const { data: exps, error } = await supabase
      .from('experiencias')
      .select('*')
      .in('area', areas)
      .eq('estado', 'publicada')
      .order('created_at', { ascending: false })

    if (error) throw createError(error.message, 500)

    // Excluir las ya habilitadas y devolver máximo 8
    return (exps ?? []).filter((e) => !habilitadasIds.has(e.id)).slice(0, 8)
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
