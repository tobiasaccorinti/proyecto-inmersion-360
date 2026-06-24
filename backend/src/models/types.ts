/**
 * Tipos TypeScript que reflejan el esquema de la base de datos (Supabase/PostgreSQL).
 * Mantener sincronizados con las tablas de la DB.
 */

export type Role = 'estudiante' | 'empresa' | 'institucion' | 'admin'
export type ValidacionEstado = 'pendiente' | 'aprobada' | 'rechazada'

export interface Profile {
  id: string                  // UUID — mismo ID que auth.users de Supabase
  role: Role
  full_name: string
  institucion_id?: string | null
  validacion_estado?: ValidacionEstado | null
  documento_url?: string | null
  validacion_notas?: string | null
  created_at?: string
}

export interface Experiencia {
  id: string
  titulo: string
  descripcion: string
  area: string
  empresa: string
  modalidad: 'virtual' | 'presencial' | 'hibrida'
  fecha: string               // ISO 8601
  duracion_minutos: number
  cupos_totales: number
  anios_recomendados: string
  url_grabacion?: string | null
  estado: 'publicada' | 'en_vivo' | 'grabada' | 'cancelada'
  creado_por: string          // UUID del perfil empresa
  created_at?: string
}

export interface Institucion {
  id: string
  nombre: string
  prefijo: string             // Ej: "ISVN"
  codigos_generados: number
  creado_por: string          // UUID del perfil institución
  created_at?: string
}

export interface CodigoAlumno {
  id: string
  codigo: string              // Ej: "ISVN-X7K2-9M4P"
  usado: boolean
  alumno_id: string | null
  nombre_alumno: string | null
  email_alumno: string | null
  institucion_id: string
  created_at?: string
}

export interface Inscripcion {
  id: string
  estudiante_id: string
  experiencia_id: string
  created_at: string
}

export interface Feedback {
  id: string
  estudiante_id: string
  experiencia_id: string
  calificacion: number        // 1-5
  comentario?: string | null
  created_at?: string
}

export interface CreateFeedbackDto {
  experiencia_id: string
  calificacion: number
  comentario?: string
}

export interface ExperienciaInstitucion {
  experiencia_id: string
  institucion_id: string
  cupos_reservados: number
}

// ── DTOs de entrada ───────────────────────────────────────────────────────────

export type TipoInstitucion = 'técnica' | 'comercial' | 'artística' | 'humanística' | 'científica' | 'general'

export interface RegisterDto {
  email: string
  password: string
  fullName: string
  role: Role
  // Estudiante
  codigoAlumno?: string
  // Institución
  nombreInstitucion?: string
  tipoInstitucion?: TipoInstitucion
  // Empresa (usa fullName como nombre de empresa)
  documentoUrl?: string
}

export interface AdminRegisterDto {
  email: string
  password: string
  fullName: string
  adminSecret: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface CreateExperienciaDto {
  titulo: string
  descripcion: string
  area: string
  modalidad: 'virtual' | 'presencial' | 'hibrida'
  fecha: string
  duracion_minutos: number
  cupos_totales: number
  anios_recomendados: string
  url_grabacion?: string
}

export interface HabilitarExperienciaDto {
  experiencia_id: string
  cupos_reservados: number
}

export interface CrearCodigosDto {
  cantidad: number
}

export interface AgregarAlumnoDto {
  nombre: string
  email: string
}

// ── JWT Payload ───────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string     // UUID del usuario
  role: Role
  email: string
  iat?: number
  exp?: number
}

export interface ValidarEmpresaDto {
  notas?: string
}
