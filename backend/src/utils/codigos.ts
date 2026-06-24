/**
 * Utilidades para generación de códigos de alumno únicos.
 * Formato: PREFIJO-XXXX-XXXX  (ej: ISVN-X7K2-9M4P)
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomSegment(length: number): string {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

/**
 * Genera un código único para un alumno usando el prefijo de la institución.
 * @param prefijo  Prefijo de la institución (ej: "ISVN")
 */
export function generarCodigoAlumno(prefijo: string): string {
  return `${prefijo}-${randomSegment(4)}-${randomSegment(4)}`
}

/**
 * Genera el prefijo de una institución a partir de su nombre.
 * Toma la primera letra de cada palabra en mayúscula (máx. 6 chars).
 * Ej: "Instituto San Vicente de Paul" → "ISVP"
 */
export function generarPrefijoInstitucion(nombre: string): string {
  return nombre
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 6)
}
