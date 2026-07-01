import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { feedbackService } from '../services/feedback.service'

export const feedbackValidation = [
  body('experiencia_id').isUUID().withMessage('ID de experiencia inválido'),
  body('calificacion').isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
  body('comentario').optional().isString().isLength({ max: 500 }),
]

export const feedbackController = {
  async enviar(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }
    try {
      const data = await feedbackService.enviar(req.user!.sub, req.body)
      res.status(201).json(data)
    } catch (err) { next(err) }
  },

  async listarDeExperiencia(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await feedbackService.listarDeExperiencia(req.params.experienciaId, req.user!.sub)
      res.json(data)
    } catch (err) { next(err) }
  },

  async resumenEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await feedbackService.resumenDeEmpresa(req.user!.sub)
      res.json(data)
    } catch (err) { next(err) }
  },

  async listarDeExperienciaInstitucion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await feedbackService.listarDeExperienciaInstitucion(req.params.experienciaId)
      res.json(data)
    } catch (err) { next(err) }
  },

  async resumenInstitucion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await feedbackService.resumenDeInstitucion(req.user!.sub)
      res.json(data)
    } catch (err) { next(err) }
  },

  async misFeedbacks(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await feedbackService.misFeeedbacks(req.user!.sub)
      res.json(data)
    } catch (err) { next(err) }
  },
}
