/**
 * Middleware de autorización por rol.
 * Se usa después de `authenticate` para restringir acceso a ciertos roles.
 *
 * Ejemplo de uso en una ruta:
 *   router.post('/crear', authenticate, requireRole('empresa'), controller)
 */

import { Request, Response, NextFunction } from 'express'
import type { Role } from '../models/types'
// Role ya incluye 'admin' — no se requieren cambios adicionales en este middleware.

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
      })
      return
    }

    next()
  }
}
