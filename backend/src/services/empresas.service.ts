import { getSupabase } from '../config/database'
import { createError } from '../middleware/errorHandler'

export const empresasService = {
  /** Devuelve la reputación de todas las empresas aprobadas */
  async listarReputaciones() {
    const supabase = getSupabase()

    const [{ data: empresas }, { data: experiencias }, { data: feedbacks }] = await Promise.all([
      supabase.from('profiles').select('id, full_name').eq('role', 'empresa').eq('validacion_estado', 'aprobada'),
      supabase.from('experiencias').select('id, creado_por'),
      supabase.from('feedbacks').select('calificacion, experiencia_id'),
    ])

    return (empresas ?? []).map((emp) => {
      const expIds = new Set((experiencias ?? []).filter((e) => e.creado_por === emp.id).map((e) => e.id))
      const fbs = (feedbacks ?? []).filter((f) => expIds.has(f.experiencia_id))
      const total_feedbacks = fbs.length
      const total_experiencias = expIds.size
      const promedio = total_feedbacks > 0
        ? Math.round((fbs.reduce((acc, f) => acc + f.calificacion, 0) / total_feedbacks) * 10) / 10
        : null
      return { empresa_id: emp.id, nombre: emp.full_name, promedio, total_feedbacks, total_experiencias }
    })
  },

  /** Reputación de una empresa específica */
  async reputacionDeEmpresa(empresaId: string) {
    const supabase = getSupabase()

    const [{ data: exp }, { data: feedbacks }] = await Promise.all([
      supabase.from('experiencias').select('id').eq('creado_por', empresaId),
      supabase.from('feedbacks')
        .select('calificacion, experiencia_id, comentario, created_at, profiles(full_name), experiencias(titulo)')
        .in('experiencia_id',
          await supabase.from('experiencias').select('id').eq('creado_por', empresaId)
            .then(({ data }) => (data ?? []).map((e) => e.id))
        )
        .order('created_at', { ascending: false })
    ])

    const total_experiencias = (exp ?? []).length
    const total_feedbacks = (feedbacks ?? []).length
    const promedio = total_feedbacks > 0
      ? Math.round(((feedbacks ?? []).reduce((acc, f) => acc + f.calificacion, 0) / total_feedbacks) * 10) / 10
      : null

    if (!exp || total_experiencias === 0) throw createError('Empresa no encontrada', 404)

    return { promedio, total_feedbacks, total_experiencias, feedbacks: feedbacks ?? [] }
  },
}
