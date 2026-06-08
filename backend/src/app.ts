/**
 * Punto de entrada de la aplicación Express.
 * Configura middleware global, rutas y manejo de errores.
 */

import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { env } from './config/env'

// Rutas
import authRoutes from './routes/auth.routes'
import experienciasRoutes from './routes/experiencias.routes'
import institucionesRoutes from './routes/instituciones.routes'
import inscripcionesRoutes from './routes/inscripciones.routes'
import codigosRoutes from './routes/codigos.routes'

// Middleware
import { errorHandler } from './middleware/errorHandler'

const app = express()

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
)

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', env: env.nodeEnv })
})

// ── Rutas de la API ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/experiencias', experienciasRoutes)
app.use('/api/instituciones', institucionesRoutes)
app.use('/api/inscripciones', inscripcionesRoutes)
app.use('/api/codigos', codigosRoutes)

// ── Manejo de errores global ──────────────────────────────────────────────────
app.use(errorHandler)

export default app
