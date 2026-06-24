/**
 * Rutas de feedback
 *
 * POST /api/feedback                          — Enviar feedback (solo estudiante)
 * GET  /api/feedback/mios                     — Mis feedbacks (estudiante)
 * GET  /api/feedback/empresa/resumen          — Resumen de todas las experiencias (empresa)
 * GET  /api/feedback/empresa/:experienciaId   — Feedbacks de una experiencia (empresa)
 * GET  /api/feedback/institucion/resumen      — Feedbacks de alumnos de la institución
 */

import { Router } from 'express'
import { feedbackController, feedbackValidation } from '../controllers/feedback.controller'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()

router.post('/', authenticate, requireRole('estudiante'), feedbackValidation, feedbackController.enviar)
router.get('/mios', authenticate, requireRole('estudiante'), feedbackController.misFeedbacks)
router.get('/empresa/resumen', authenticate, requireRole('empresa'), feedbackController.resumenEmpresa)
router.get('/empresa/:experienciaId', authenticate, requireRole('empresa'), feedbackController.listarDeExperiencia)
router.get('/institucion/resumen', authenticate, requireRole('institucion'), feedbackController.resumenInstitucion)

export default router
