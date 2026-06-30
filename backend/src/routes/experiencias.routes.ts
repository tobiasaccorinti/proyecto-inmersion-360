/**
 * Rutas de experiencias
 *
 * GET    /api/experiencias              — Lista experiencias (pública, con filtros)
 * GET    /api/experiencias/mias         — Experiencias de la empresa autenticada
 * GET    /api/experiencias/:id          — Detalle de una experiencia
 * POST   /api/experiencias              — Crear experiencia (solo empresa)
 * PATCH  /api/experiencias/:id/estado   — Cambiar estado (solo empresa dueña)
 * GET    /api/experiencias/:id/inscripciones — Inscriptos (solo empresa dueña)
 */

import { Router } from 'express'
import {
  experienciasController,
  createExperienciaValidation,
} from '../controllers/experiencias.controller'
import { inscripcionesController } from '../controllers/inscripciones.controller'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()

router.get('/', experienciasController.listar)
router.get('/mias', authenticate, requireRole('empresa'), experienciasController.miasExperiencias)
router.get('/recomendadas/para-mi', authenticate, requireRole('estudiante'), experienciasController.recomendadas)
router.get('/:id', experienciasController.obtener)
router.post('/', authenticate, requireRole('empresa'), createExperienciaValidation, experienciasController.crear)
router.put('/:id', authenticate, requireRole('empresa'), experienciasController.actualizar)
router.patch('/:id/estado', authenticate, requireRole('empresa'), experienciasController.actualizarEstado)
router.get('/:experienciaId/inscripciones', authenticate, requireRole('empresa'), inscripcionesController.listarDeExperiencia)

export default router
