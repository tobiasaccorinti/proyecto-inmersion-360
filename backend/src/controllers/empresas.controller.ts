import { Request, Response, NextFunction } from 'express'
import { empresasService } from '../services/empresas.service'

export const empresasController = {
  async listarReputaciones(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await empresasService.listarReputaciones()
      res.json(data)
    } catch (err) { next(err) }
  },

  async miReputacion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await empresasService.reputacionDeEmpresa(req.user!.sub)
      res.json(data)
    } catch (err) { next(err) }
  },
}
