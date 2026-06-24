/**
 * Cliente de Supabase con Service Role Key para el backend.
 * Este cliente tiene permisos elevados (bypass RLS) — usar solo en el backend,
 * nunca exponer la SERVICE_ROLE_KEY al frontend.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseInstance
}
