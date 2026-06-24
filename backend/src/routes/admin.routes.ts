/**
 * Rutas de administración
 *
 * POST  /api/admin/register           — Crear perfil admin (requiere ADMIN_SECRET)
 * GET   /api/admin/empresas           — Listar todas las empresas (solo admin)
 * PATCH /api/admin/empresas/:id/aprobar  — Aprobar empresa (solo admin)
 * PATCH /api/admin/empresas/:id/rechazar — Rechazar empresa (solo admin)
 */

import { Router } from 'express'
import { adminController, adminRegisterValidation } from '../controllers/admin.controller'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()

router.post('/register', adminRegisterValidation, adminController.register)

router.get('/empresas', authenticate, requireRole('admin'), adminController.listarEmpresas)
router.patch('/empresas/:id/aprobar', authenticate, requireRole('admin'), adminController.aprobarEmpresa)
router.patch('/empresas/:id/rechazar', authenticate, requireRole('admin'), adminController.rechazarEmpresa)

export default router
