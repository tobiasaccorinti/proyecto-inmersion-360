/**
 * Controlador de códigos de alumno.
 */

import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { codigosService } from '../services/codigos.service'
import { institucionesService } from '../services/instituciones.service'

export const generarCodigosValidation = [
  body('cantidad').isInt({ min: 1, max: 200 }).withMessage('La cantidad debe ser entre 1 y 200'),
]

export const codigosController = {
  async generar(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }
    try {
      const inst = await institucionesService.obtenerMia(req.user!.sub)
      const data = await codigosService.generar(inst.id, inst.prefijo, req.body.cantidad)
      res.status(201).json(data)
    } catch (err) {
      next(err)
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const inst = await institucionesService.obtenerMia(req.user!.sub)
      const data = await codigosService.listar(inst.id)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },
}
