/**
 * Servicio de administración.
 * Gestiona la validación de empresas y el registro del perfil admin.
 */

import { getSupabase } from '../config/database'
import { signToken } from '../utils/jwt'
import { createError } from '../middleware/errorHandler'
import type { AdminRegisterDto } from '../models/types'
import { env } from '../config/env'

export const adminService = {
  async registrarAdmin(dto: AdminRegisterDto) {
    if (dto.adminSecret !== env.adminSecret) {
      throw createError('Clave de administrador inválida', 403)
    }

    const supabase = getSupabase()

    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    })

    if (signUpError || !authData.user) {
      throw createError(signUpError?.message ?? 'Error al crear el usuario admin', 400)
    }

    const userId = authData.user.id

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, role: 'admin', full_name: dto.fullName })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      throw createError('Error al crear el perfil admin: ' + profileError.message, 400)
    }

    const token = signToken({ sub: userId, role: 'admin', email: dto.email })
    return { token, role: 'admin' }
  },

  async listarEmpresas() {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'empresa')
      .order('created_at', { ascending: false })
    if (error) throw createError(error.message, 500)
    return data ?? []
  },

  async aprobarEmpresa(empresaId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .update({ validacion_estado: 'aprobada', validacion_notas: null })
      .eq('id', empresaId)
      .eq('role', 'empresa')
      .select()
      .single()
    if (error) throw createError(error.message, 500)
    if (!data) throw createError('Empresa no encontrada', 404)
    return data
  },

  async rechazarEmpresa(empresaId: string, notas?: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .update({ validacion_estado: 'rechazada', validacion_notas: notas ?? null })
      .eq('id', empresaId)
      .eq('role', 'empresa')
      .select()
      .single()
    if (error) throw createError(error.message, 500)
    if (!data) throw createError('Empresa no encontrada', 404)
    return data
  },
}
