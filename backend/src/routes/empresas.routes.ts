import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { empresasController } from '../controllers/empresas.controller'

const router = Router()

// Pública para usuarios autenticados (estudiantes, instituciones)
router.get('/reputaciones', authenticate, empresasController.listarReputaciones)

// Para la empresa ver su propia reputación
router.get('/mi-reputacion', authenticate, requireRole('empresa'), empresasController.miReputacion)

export default router
