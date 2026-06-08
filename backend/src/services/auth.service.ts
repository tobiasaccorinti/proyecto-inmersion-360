/**
 * Servicio de autenticación.
 * Interactúa con Supabase Auth y la tabla `profiles`.
 */

import { getSupabase } from '../config/database'
import { signToken } from '../utils/jwt'
import { generarPrefijoInstitucion } from '../utils/codigos'
import { createError } from '../middleware/errorHandler'
import type { RegisterDto, LoginDto } from '../models/types'

export const authService = {
  async register(dto: RegisterDto) {
    const supabase = getSupabase()

    // ── Validaciones previas ────────────────────────────────────────────────
    let codigoAlumnoData: { id: string; institucion_id: string } | null = null

    if (dto.role === 'estudiante') {
      if (!dto.codigoAlumno) {
        throw createError('El código de alumno es requerido', 400)
      }

      const { data: codigo, error } = await supabase
        .from('codigos_alumno')
        .select('id, usado, institucion_id, email_alumno')
        .eq('codigo', dto.codigoAlumno.trim().toUpperCase())
        .single()

      if (error) throw createError(error.message, 400)
      if (!codigo) throw createError('El código ingresado no existe', 400)
      if (codigo.usado) throw createError('Este código ya fue utilizado', 400)
      if (codigo.email_alumno && codigo.email_alumno !== dto.email) {
        throw createError('El código no corresponde a tu email', 400)
      }

      // Guardamos datos para usarlos después
      codigoAlumnoData = { id: codigo.id, institucion_id: codigo.institucion_id }
    }

    // ── Crear usuario en Supabase Auth ──────────────────────────────────────
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    })

    if (signUpError || !authData.user) {
      throw createError(signUpError?.message ?? 'Error al crear el usuario', 400)
    }

    const userId = authData.user.id

    // ── Crear perfil y datos por rol ────────────────────────────────────────
    if (dto.role === 'estudiante') {
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'estudiante',
          full_name: dto.fullName,
          institucion_id: codigoAlumnoData!.institucion_id,
        })

      await supabase
        .from('codigos_alumno')
        .update({ usado: true, alumno_id: userId })
        .eq('id', codigoAlumnoData!.id)

    } else if (dto.role === 'institucion') {
      const prefijo = generarPrefijoInstitucion(dto.nombreInstitucion!)

      await supabase
        .from('profiles')
        .insert({ id: userId, role: 'institucion', full_name: dto.fullName })

      await supabase
        .from('instituciones')
        .insert({ nombre: dto.nombreInstitucion!, prefijo, creado_por: userId })

    } else {
      // empresa
      await supabase
        .from('profiles')
        .insert({ id: userId, role: 'empresa', full_name: dto.fullName })
    }

    // ── Generar token propio ────────────────────────────────────────────────
    const token = signToken({ sub: userId, role: dto.role, email: dto.email })
    return { token, role: dto.role }
  },

  /**
   * Inicia sesión verificando credenciales con Supabase Auth.
   * Devuelve un JWT propio del backend y el perfil del usuario.
   */
  async login(dto: LoginDto) {
    const supabase = getSupabase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    })

    if (error || !data.user) throw createError('Email o contraseña incorrectos', 401)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!profile) throw createError('Perfil de usuario no encontrado', 404)

    const token = signToken({ sub: data.user.id, role: profile.role, email: dto.email })
    return { token, profile }
  },

  /**
   * Devuelve el perfil del usuario autenticado.
   */
  async getMe(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) throw createError('Perfil no encontrado', 404)
    return data
  },
}
