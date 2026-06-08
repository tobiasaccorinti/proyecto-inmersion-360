'use client'

/**
 * Formulario de creación de experiencia para el dashboard de empresa.
 */

import { useState } from 'react'
import { useFormState } from '../hooks/useFormState'
import { experienciasService, type CrearExperienciaPayload } from '../services/experienciasService'
import { AREAS, MODALIDADES } from '../utils/constants'
import type { Experiencia } from '../types'

interface CrearExperienciaFormProps {
  token: string
  onCreated: (exp: Experiencia) => void
}

export function CrearExperienciaForm({ token, onCreated }: CrearExperienciaFormProps) {
  const { loading, error, success, run, setSuccess } = useFormState()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [area, setArea] = useState('Tecnología')
  const [modalidad, setModalidad] = useState<'virtual' | 'presencial' | 'hibrida'>('virtual')
  const [fecha, setFecha] = useState('')
  const [duracion, setDuracion] = useState(60)
  const [cupos, setCupos] = useState(30)
  const [anios, setAnios] = useState('3ro a 6to año')
  const [urlGrabacion, setUrlGrabacion] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await run(async () => {
      const payload: CrearExperienciaPayload = {
        titulo, descripcion, area, modalidad, fecha,
        duracion_minutos: duracion, cupos_totales: cupos,
        anios_recomendados: anios,
        url_grabacion: urlGrabacion || undefined,
      }
      const nueva = await experienciasService.crear(payload, token)
      onCreated(nueva)
      setSuccess('Experiencia creada exitosamente.')
      setTitulo(''); setDescripcion(''); setFecha(''); setUrlGrabacion('')
      setCupos(30); setDuracion(60)
    })
  }

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all'
  const labelClass = 'text-sm font-semibold text-gray-700 block mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100">
      <h2
        style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
        className="text-lg font-bold text-gray-900 mb-6"
      >
        Nueva experiencia
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
          ✓ {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Título *</label>
          <input
            className={inputClass}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Cómo se crea una app desde cero"
            required
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-none`}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción breve de la experiencia..."
          />
        </div>

        <div>
          <label className={labelClass}>Área *</label>
          <select className={inputClass} value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Modalidad *</label>
          <select
            className={inputClass}
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value as typeof modalidad)}
          >
            {MODALIDADES.map((m) => <option key={m} className="capitalize">{m}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Fecha *</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Duración (min) *</label>
          <input
            type="number"
            className={inputClass}
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
            min={1}
          />
        </div>

        <div>
          <label className={labelClass}>Cupos totales *</label>
          <input
            type="number"
            className={inputClass}
            value={cupos}
            onChange={(e) => setCupos(Number(e.target.value))}
            min={1}
          />
        </div>

        <div>
          <label className={labelClass}>Años recomendados</label>
          <input
            className={inputClass}
            value={anios}
            onChange={(e) => setAnios(e.target.value)}
            placeholder="Ej: 3ro a 6to año"
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>URL de grabación (opcional)</label>
          <input
            type="url"
            className={inputClass}
            value={urlGrabacion}
            onChange={(e) => setUrlGrabacion(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creando...' : 'Crear experiencia'}
      </button>
    </form>
  )
}
