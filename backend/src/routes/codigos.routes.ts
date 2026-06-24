/**
 * Rutas de códigos de alumno
 *
 * GET   /api/codigos        — Listar códigos de mi institución
 * POST  /api/codigos/generar — Generar nuevos códigos
 */

import { Router } from 'express'
import { codigosController, generarCodigosValidation } from '../controllers/codigos.controller'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()
const guard = [authenticate, requireRole('institucion')]

router.get('/', ...guard, codigosController.listar)
router.post('/generar', ...guard, generarCodigosValidation, codigosController.generar)

export default router
