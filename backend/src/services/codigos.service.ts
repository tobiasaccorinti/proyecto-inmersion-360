/**
 * Servicio de códigos de alumno.
 * Gestiona la generación masiva de códigos por institución.
 */

import { getSupabase } from '../config/database'
import { createError } from '../middleware/errorHandler'
import { generarCodigoAlumno } from '../utils/codigos'

export const codigosService = {
  /** Genera N códigos únicos para una institución */
  async generar(institucionId: string, prefijo: string, cantidad: number) {
    if (cantidad < 1 || cantidad > 200) {
      throw createError('La cantidad debe estar entre 1 y 200', 400)
    }

    const supabase = getSupabase()
    const nuevos = Array.from({ length: cantidad }, () => ({
      codigo: generarCodigoAlumno(prefijo),
      usado: false,
      institucion_id: institucionId,
      nombre_alumno: null,
      email_alumno: null,
      alumno_id: null,
    }))

    const { data, error } = await supabase.from('codigos_alumno').insert(nuevos).select()
    if (error) throw createError(error.message, 500)

    return data
  },

  /** Lista los códigos de una institución */
  async listar(institucionId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('codigos_alumno')
      .select('*')
      .eq('institucion_id', institucionId)
      .order('created_at', { ascending: false })
    if (error) throw createError(error.message, 500)
    return data
  },
}
