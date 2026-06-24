/**
 * Controlador de administración.
 * Gestiona el registro del admin y la validación de empresas.
 */

import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { adminService } from '../services/admin.service'

export const adminRegisterValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('fullName').notEmpty().withMessage('El nombre completo es requerido'),
  body('adminSecret').notEmpty().withMessage('La clave de administrador es requerida'),
]

export const adminController = {
  async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    try {
      const result = await adminService.registrarAdmin(req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },

  async listarEmpresas(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.listarEmpresas()
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async aprobarEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.aprobarEmpresa(req.params.id)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async rechazarEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.rechazarEmpresa(req.params.id, req.body.notas)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },
}
