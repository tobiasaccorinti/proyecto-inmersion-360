/**
 * Controlador de instituciones.
 */

import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { institucionesService } from '../services/instituciones.service'

export const agregarAlumnoValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
]

export const crearInstitucionValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
]

export const institucionesController = {
  async crear(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }
    try {
      const data = await institucionesService.crear(req.user!.sub, req.body.nombre)
      res.status(201).json(data)
    } catch (err) {
      next(err)
    }
  },

  async obtenerMia(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await institucionesService.obtenerMia(req.user!.sub)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async listarAlumnos(req: Request, res: Response, next: NextFunction) {
    try {
      const inst = await institucionesService.obtenerMia(req.user!.sub)
      const data = await institucionesService.listarAlumnos(inst.id)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async habilitarExperiencia(req: Request, res: Response, next: NextFunction) {
    try {
      const inst = await institucionesService.obtenerMia(req.user!.sub)
      const data = await institucionesService.habilitarExperiencia(inst.id, req.body)
      res.status(201).json(data)
    } catch (err) {
      next(err)
    }
  },

  async deshabilitarExperiencia(req: Request, res: Response, next: NextFunction) {
    try {
      const inst = await institucionesService.obtenerMia(req.user!.sub)
      await institucionesService.deshabilitarExperiencia(inst.id, req.params.experienciaId)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async listarExperienciasHabilitadas(req: Request, res: Response, next: NextFunction) {
    try {
      const inst = await institucionesService.obtenerMia(req.user!.sub)
      const data = await institucionesService.listarExperienciasHabilitadas(inst.id)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async recomendaciones(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await institucionesService.recomendaciones(req.user!.sub)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async agregarAlumno(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }
    try {
      const inst = await institucionesService.obtenerMia(req.user!.sub)
      const data = await institucionesService.agregarAlumno(inst.id, inst.prefijo, req.body)
      res.status(201).json(data)
    } catch (err) {
      next(err)
    }
  },
}
