/**
 * Rutas de autenticación
 *
 * POST /api/auth/register  — Registro de nuevo usuario
 * POST /api/auth/login     — Inicio de sesión
 * GET  /api/auth/me        — Perfil del usuario autenticado
 */

import { Router } from 'express'
import { authController, registerValidation, loginValidation } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/register', registerValidation, authController.register)
router.post('/login', loginValidation, authController.login)
router.get('/me', authenticate, authController.me)

export default router
