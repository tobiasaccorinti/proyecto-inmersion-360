/**
 * Controlador de inscripciones.
 */

import { Request, Response, NextFunction } from 'express'
import { inscripcionesService } from '../services/inscripciones.service'

export const inscripcionesController = {
  async inscribir(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await inscripcionesService.inscribir(req.user!.sub, req.params.experienciaId)
      res.status(201).json(data)
    } catch (err) {
      next(err)
    }
  },

  async miasInscripciones(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await inscripcionesService.listarDeAlumno(req.user!.sub)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async cancelar(req: Request, res: Response, next: NextFunction) {
    try {
      await inscripcionesService.cancelar(req.user!.sub, req.params.id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async listarDeExperiencia(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await inscripcionesService.listarDeExperiencia(req.params.experienciaId, req.user!.sub)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },
}
