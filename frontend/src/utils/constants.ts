// ============================================================
// Constantes reutilizables en toda la aplicación Inspira
// ============================================================

export const AREAS = [
  'Tecnología',
  'Salud',
  'Diseño',
  'Finanzas',
  'Oficios',
  'Marketing',
  'Derecho',
  'Ambiente',
] as const

export type Area = typeof AREAS[number]

export const MODALIDADES = ['virtual', 'presencial', 'hibrida'] as const
export const ESTADOS_EXPERIENCIA = ['publicada', 'en_vivo', 'grabada', 'cancelada'] as const

/** Emoji representativo de cada área */
export const AREA_EMOJI: Record<string, string> = {
  Tecnología: '💻',
  Salud: '🏥',
  Diseño: '🎨',
  Finanzas: '💰',
  Oficios: '🔧',
  Marketing: '📣',
  Derecho: '⚖️',
  Ambiente: '🌿',
}

/** Clases Tailwind para el fondo degradado de cada área */
export const AREA_GRADIENT: Record<string, string> = {
  Tecnología: 'from-blue-100 to-blue-50',
  Salud: 'from-green-100 to-green-50',
  Diseño: 'from-pink-100 to-pink-50',
  Finanzas: 'from-yellow-100 to-yellow-50',
  Oficios: 'from-orange-100 to-orange-50',
  Marketing: 'from-purple-100 to-purple-50',
  Derecho: 'from-red-100 to-red-50',
  Ambiente: 'from-teal-100 to-teal-50',
}

/** Clases Tailwind para el badge de área */
export const AREA_BADGE: Record<string, string> = {
  Tecnología: 'bg-blue-50 text-blue-600',
  Salud: 'bg-green-50 text-green-600',
  Diseño: 'bg-pink-50 text-pink-600',
  Finanzas: 'bg-yellow-50 text-yellow-600',
  Oficios: 'bg-orange-50 text-orange-600',
  Marketing: 'bg-purple-50 text-purple-600',
  Derecho: 'bg-red-50 text-red-600',
  Ambiente: 'bg-teal-50 text-teal-600',
}

/** Etiquetas legibles para estados de experiencia */
export const ESTADO_LABEL: Record<string, string> = {
  publicada: 'Publicada',
  en_vivo: 'En vivo',
  grabada: 'Grabada',
  cancelada: 'Cancelada',
}

/** Clases de color para cada estado */
export const ESTADO_COLOR: Record<string, string> = {
  publicada: 'bg-indigo-50 text-indigo-600',
  en_vivo: 'bg-green-50 text-green-600',
  grabada: 'bg-purple-50 text-purple-600',
  cancelada: 'bg-red-50 text-red-600',
}

export const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
