// ============================================================
// Tipos compartidos de Inspira
// Usados en frontend (componentes, hooks, servicios)
// ============================================================

export type Role = 'estudiante' | 'empresa' | 'institucion' | 'admin'
export type ValidacionEstado = 'pendiente' | 'aprobada' | 'rechazada'

export interface Profile {
  id: string
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
  fecha: string
  duracion_minutos: number
  cupos_totales: number
  anios_recomendados: string
  url_grabacion?: string | null
  estado: 'publicada' | 'en_vivo' | 'grabada' | 'cancelada'
  creado_por: string
  created_at?: string
}

export interface Inscripcion {
  id: string
  estudiante_id: string
  experiencia_id: string
  created_at: string
  experiencias?: Experiencia
}

export interface Feedback {
  id: string
  estudiante_id: string
  experiencia_id: string
  calificacion: number
  comentario?: string | null
  created_at?: string
  profiles?: { full_name: string }
  experiencias?: { titulo: string; area: string; empresa: string; fecha: string }
}

export interface ReputacionEmpresa {
  empresa_id: string
  nombre: string
  promedio: number | null
  total_feedbacks: number
  total_experiencias: number
}

export interface MiReputacion {
  promedio: number | null
  total_feedbacks: number
  total_experiencias: number
  feedbacks: (Feedback & { profiles?: { full_name: string }; experiencias?: { titulo: string } })[]
}

export interface FeedbackResumenEmpresa {
  id: string
  titulo: string
  area: string
  fecha: string
  promedio: number | null
  total_feedbacks: number
  feedbacks: (Feedback & { profiles?: { full_name: string } })[]
}

export interface Institucion {
  id: string
  nombre: string
  prefijo: string
  codigos_generados: number
  creado_por: string
}

export interface CodigoAlumno {
  id: string
  codigo: string
  usado: boolean
  alumno_id: string | null
  nombre_alumno: string | null
  email_alumno: string | null
  institucion_id: string
}

export interface AlumnoInstitucion {
  id: string
  nombre: string
  email: string
  codigo_id: string | null
  codigos_alumno: { codigo: string } | null
}

export interface ExperienciaInstitucion {
  experiencia_id: string
  institucion_id: string
  cupos_reservados: number
}

// Respuestas genéricas de la API del backend
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  statusCode?: number
}
