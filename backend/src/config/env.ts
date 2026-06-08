/**
 * Configuración y validación de variables de entorno del backend.
 * Falla rápido si faltan variables críticas, evitando errores en runtime.
 */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Variable de entorno requerida faltante: ${key}`)
  }
  return value
}

export const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',

  supabase: {
    url: requireEnv('SUPABASE_URL'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
} as const
