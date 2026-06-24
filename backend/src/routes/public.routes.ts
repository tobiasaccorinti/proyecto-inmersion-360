/**
 * Rutas públicas (sin auth)
 */

import { Router, Request, Response } from 'express'
import { getSupabase } from '../config/database'

const router = Router()

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabase()
    
    // Contar total de experiencias
    const { count: exps } = await supabase.from('experiencias').select('*', { count: 'exact', head: true })
    
    // Contar estudiantes
    const { count: students } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'estudiante')
    
    // Contar empresas
    const { count: companies } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'empresa')

    res.json({
      experiencias: `${exps ?? 0}+`,
      estudiantes: (students ?? 0).toLocaleString('es-AR'),
      empresas: companies ?? 0,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas' })
  }
})

export default router
