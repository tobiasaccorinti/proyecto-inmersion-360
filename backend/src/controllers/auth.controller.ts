/**
 * Controlador de autenticación.
 * Delega la lógica al authService y devuelve respuestas HTTP.
 */

import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { authService } from '../services/auth.service'

// ── Reglas de validación ──────────────────────────────────────────────────────

export const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('fullName').notEmpty().withMessage('El nombre completo es requerido'),
  body('role').isIn(['estudiante', 'empresa', 'institucion']).withMessage('Rol inválido'),
  body('nombreInstitucion').if(body('role').equals('institucion')).notEmpty().withMessage('El nombre de la institución es requerido'),
]

export const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
]

// ── Handlers ──────────────────────────────────────────────────────────────────

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    try {
      const result = await authService.login(req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getMe(req.user!.sub)
      res.json(profile)
    } catch (err) {
      next(err)
    }
  },
}
