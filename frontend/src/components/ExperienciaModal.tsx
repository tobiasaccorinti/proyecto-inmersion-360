'use client'

/**
 * Modal de detalles de una experiencia.
 * Muestra la información completa y permite inscribirse.
 */

import { AREA_EMOJI, AREA_GRADIENT, AREA_BADGE } from '../utils/constants'
import { formatDate, formatDuration } from '../utils/helpers'
import type { Experiencia } from '../types'

interface ExperienciaModalProps {
  experiencia: Experiencia
  yaInscripto: boolean
  inscribiendo: boolean
  onClose: () => void
  onInscribir: (id: string) => void
  /** Si es true, no muestra el botón de inscripción (vista empresa/institución) */
  soloLectura?: boolean
}

export function ExperienciaModal({
  experiencia,
  yaInscripto,
  inscribiendo,
  onClose,
  onInscribir,
  soloLectura = false,
}: ExperienciaModalProps) {
  const gradient = AREA_GRADIENT[experiencia.area] ?? 'from-indigo-100 to-indigo-50'
  const badge = AREA_BADGE[experiencia.area] ?? 'bg-gray-50 text-gray-600'
  const emoji = AREA_EMOJI[experiencia.area] ?? '📚'

  const detalles = [
    { label: 'Modalidad', value: experiencia.modalidad },
    { label: 'Duración', value: formatDuration(experiencia.duracion_minutos) },
    { label: 'Fecha', value: formatDate(experiencia.fecha) },
    { label: 'Años recomendados', value: experiencia.anios_recomendados },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        {/* Header con emoji */}
        <div
          className={`h-40 flex items-center justify-center relative bg-gradient-to-br ${gradient}`}
        >
          <span className="text-6xl">{emoji}</span>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>
              {experiencia.area}
            </span>
            <h2
              style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
              className="text-xl font-bold text-gray-900 mt-3 mb-1"
            >
              {experiencia.titulo}
            </h2>
            <p className="text-sm text-gray-500">{experiencia.empresa}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {detalles.map((item) => (
              <div key={item.label} className="bg-[#EEEFFE] rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{item.value}</p>
              </div>
            ))}
          </div>

          {experiencia.descripcion && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Descripción
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{experiencia.descripcion}</p>
            </div>
          )}

          {experiencia.url_grabacion && (
            <div className="mb-4">
              <a
                href={experiencia.url_grabacion}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                Ver grabación →
              </a>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm py-2.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>

            {!soloLectura && (
              yaInscripto ? (
                <span className="flex-1 bg-green-50 text-green-600 font-medium text-sm py-2.5 rounded-full text-center">
                  ✓ Ya inscripto
                </span>
              ) : (
                <button
                  onClick={() => onInscribir(experiencia.id)}
                  disabled={inscribiendo}
                  className="flex-1 bg-indigo-600 text-white font-semibold text-sm py-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {inscribiendo ? 'Inscribiendo...' : 'Inscribirme →'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
