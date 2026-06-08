/**
 * Middleware de autenticación JWT.
 * Extrae el token del header Authorization: Bearer <token>
 * y adjunta el payload decodificado a req.user.
 */

import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import type { JwtPayload } from '../models/types'

// Extender el tipo Request de Express para incluir `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token de autorización requerido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}
