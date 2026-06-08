/**
 * Funciones auxiliares reutilizables en el frontend de Inspira.
 */

/**
 * Formatea una fecha ISO 8601 a formato legible en español.
 * Ej: "2026-07-15T18:00:00Z" → "15 de julio de 2026"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formatea duración en minutos a texto legible.
 * Ej: 90 → "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/**
 * Genera el prefijo de una institución desde su nombre.
 * Ej: "Instituto San Vicente" → "ISV"
 */
export function generarPrefijo(nombre: string): string {
  return nombre
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 6)
}

/**
 * Devuelve la inicial de un nombre para avatares.
 */
export function getInitial(nombre: string): string {
  return nombre?.charAt(0).toUpperCase() ?? '?'
}

/**
 * Capitaliza la primera letra de un string.
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Trunca un texto a maxLen caracteres con "…".
 */
export function truncate(text: string, maxLen = 80): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}
