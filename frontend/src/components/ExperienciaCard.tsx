'use client'

/**
 * Tarjeta de experiencia para las grillas de exploración.
 */

import { AREA_EMOJI, AREA_GRADIENT, AREA_BADGE, ESTADO_COLOR, ESTADO_LABEL } from '../utils/constants'
import { formatDate } from '../utils/helpers'
import type { Experiencia } from '../types'

interface ExperienciaCardProps {
  experiencia: Experiencia
  yaInscripto?: boolean
  onClick: (exp: Experiencia) => void
  /** Muestra badge de estado en lugar del badge de inscripción */
  mostrarEstado?: boolean
}

export function ExperienciaCard({
  experiencia,
  yaInscripto,
  onClick,
  mostrarEstado = false,
}: ExperienciaCardProps) {
  const gradient = AREA_GRADIENT[experiencia.area] ?? 'from-indigo-100 to-indigo-50'
  const badge = AREA_BADGE[experiencia.area] ?? 'bg-gray-50 text-gray-600'
  const emoji = AREA_EMOJI[experiencia.area] ?? '📚'

  return (
    <div
      onClick={() => onClick(experiencia)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div
        className={`h-28 flex items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        <span className="text-4xl">{emoji}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
            {experiencia.area}
          </span>
          {mostrarEstado && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_COLOR[experiencia.estado] ?? ''}`}
            >
              {ESTADO_LABEL[experiencia.estado]}
            </span>
          )}
          {!mostrarEstado && yaInscripto && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
              ✓ Inscripto
            </span>
          )}
        </div>
        <h3
          style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
          className="font-bold text-gray-900 text-sm mb-1 line-clamp-2"
        >
          {experiencia.titulo}
        </h3>
        <p className="text-xs text-gray-500">{experiencia.empresa}</p>
        <p className="text-xs text-gray-400 mt-2">{formatDate(experiencia.fecha)}</p>
        <p className="text-xs text-gray-400 capitalize">{experiencia.modalidad}</p>
      </div>
    </div>
  )
}
