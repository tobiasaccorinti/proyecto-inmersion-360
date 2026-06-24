/**
 * Rutas de instituciones
 *
 * GET    /api/instituciones/mia                          — Mi institución
 * GET    /api/instituciones/mia/alumnos                  — Alumnos de mi institución
 * POST   /api/instituciones/mia/alumnos                  — Agregar alumno
 * GET    /api/instituciones/mia/experiencias             — Experiencias habilitadas
 * POST   /api/instituciones/mia/experiencias             — Habilitar experiencia
 * DELETE /api/instituciones/mia/experiencias/:expId      — Deshabilitar experiencia
 */

import { Router } from 'express'
import {
  institucionesController,
  agregarAlumnoValidation,
  crearInstitucionValidation,
} from '../controllers/instituciones.controller'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()
const guard = [authenticate, requireRole('institucion')]

router.post('/', authenticate, crearInstitucionValidation, institucionesController.crear)
router.get('/mia', ...guard, institucionesController.obtenerMia)
router.get('/mia/alumnos', ...guard, institucionesController.listarAlumnos)
router.post('/mia/alumnos', ...guard, agregarAlumnoValidation, institucionesController.agregarAlumno)
router.get('/mia/recomendaciones', ...guard, institucionesController.recomendaciones)
router.get('/mia/experiencias', ...guard, institucionesController.listarExperienciasHabilitadas)
router.post('/mia/experiencias', ...guard, institucionesController.habilitarExperiencia)
router.delete('/mia/experiencias/:experienciaId', ...guard, institucionesController.deshabilitarExperiencia)

export default router
