/**
 * Middleware global de manejo de errores.
 * Captura cualquier error no controlado y devuelve una respuesta JSON uniforme.
 */

import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500
  const message = err.message ?? 'Error interno del servidor'

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err)
  }

  res.status(statusCode).json({ message })
}

/** Helper para crear errores con statusCode personalizado */
export function createError(message: string, statusCode: number): AppError {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  return err
}
