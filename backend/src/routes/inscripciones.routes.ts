/**
 * Rutas de inscripciones
 *
 * GET    /api/inscripciones/mias                       — Mis inscripciones (alumno)
 * POST   /api/inscripciones/:experienciaId             — Inscribirse (alumno)
 * DELETE /api/inscripciones/:id                        — Cancelar inscripción (alumno)
 */

import { Router } from 'express'
import { inscripcionesController } from '../controllers/inscripciones.controller'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()
const guard = [authenticate, requireRole('estudiante')]

router.get('/mias', ...guard, inscripcionesController.miasInscripciones)
router.post('/:experienciaId', ...guard, inscripcionesController.inscribir)
router.delete('/:id', ...guard, inscripcionesController.cancelar)

export default router
