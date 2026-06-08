/**
 * Helpers para generación y verificación de tokens JWT.
 */

import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { JwtPayload } from '../models/types'

/**
 * Genera un JWT firmado con los datos del usuario.
 */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions)
}

/**
 * Verifica y decodifica un token JWT.
 * Lanza error si el token es inválido o expirado.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.secret) as JwtPayload
}
