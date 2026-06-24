/**
 * Controlador de experiencias.
 */

import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { experienciasService } from '../services/experiencias.service'

export const createExperienciaValidation = [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('area').notEmpty().withMessage('El área es requerida'),
  body('modalidad').isIn(['virtual', 'presencial', 'hibrida']).withMessage('Modalidad inválida'),
  body('fecha').isISO8601().withMessage('Fecha inválida (use ISO 8601)'),
  body('duracion_minutos').isInt({ min: 1 }).withMessage('Duración inválida'),
  body('cupos_totales').isInt({ min: 1 }).withMessage('Los cupos deben ser al menos 1'),
]

export const experienciasController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { area, estado, institucion_id } = req.query
      const data = await experienciasService.listar({
        area: area as string,
        estado: estado as string,
        institucionId: institucion_id as string,
      })
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await experienciasService.obtener(req.params.id)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }
    try {
      const { getSupabase } = await import('../config/database')
      const { data: profile } = await getSupabase()
        .from('profiles')
        .select('full_name, validacion_estado')
        .eq('id', req.user!.sub)
        .single()

      if (!profile || profile.validacion_estado !== 'aprobada') {
        res.status(403).json({
          message: 'Tu cuenta de empresa aún no fue validada por un administrador. Podrás publicar experiencias una vez que sea aprobada.',
        })
        return
      }

      const data = await experienciasService.crear(req.user!.sub, profile.full_name ?? '', req.body)
      res.status(201).json(data)
    } catch (err) {
      next(err)
    }
  },

  async miasExperiencias(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await experienciasService.listarDeEmpresa(req.user!.sub)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async recomendadas(req: Request, res: Response, next: NextFunction) {
    try {
      const { getSupabase } = await import('../config/database')
      const { data: profile } = await getSupabase()
        .from('profiles')
        .select('institucion_id')
        .eq('id', req.user!.sub)
        .single()
      const data = await experienciasService.recomendadasParaEstudiante(
        req.user!.sub,
        profile?.institucion_id ?? null
      )
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async actualizarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await experienciasService.actualizarEstado(req.params.id, req.user!.sub, req.body.estado)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },
}
