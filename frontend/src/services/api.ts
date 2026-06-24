/**
 * Cliente HTTP base para consumir la API del backend Inspira.
 * Todas las llamadas se centralizan aquí para mayor mantenibilidad.
 *
 * La URL base se configura en NEXT_PUBLIC_API_URL (frontend .env.local).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

/**
 * Realiza una llamada a la API del backend.
 * Lanza un Error con el mensaje del servidor si la respuesta no es 2xx.
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data?.message ?? `Error ${res.status}`
    throw new Error(message)
  }

  return data as T
}
