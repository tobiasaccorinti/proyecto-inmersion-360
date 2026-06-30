'use client'

import { useState } from 'react'
import { useFormState } from '../hooks/useFormState'
import { experienciasService } from '../services/experienciasService'
import { AREAS, MODALIDADES } from '../utils/constants'
import type { Experiencia } from '../types'

interface EditarExperienciaFormProps {
  experiencia: Experiencia
  token: string
  onUpdated: (exp: Experiencia) => void
  onCancel: () => void
}

export function EditarExperienciaForm({ experiencia, token, onUpdated, onCancel }: EditarExperienciaFormProps) {
  const { loading, error, run } = useFormState()

  const [titulo, setTitulo] = useState(experiencia.titulo)
  const [descripcion, setDescripcion] = useState(experiencia.descripcion ?? '')
  const [area, setArea] = useState(experiencia.area)
  const [modalidad, setModalidad] = useState<'virtual' | 'presencial' | 'hibrida'>(experiencia.modalidad)
  const [fecha, setFecha] = useState(experiencia.fecha ? experiencia.fecha.slice(0, 16) : '')
  const [duracion, setDuracion] = useState(experiencia.duracion_minutos)
  const [cupos, setCupos] = useState(experiencia.cupos_totales)
  const [anios, setAnios] = useState(experiencia.anios_recomendados ?? '')
  const [urlGrabacion, setUrlGrabacion] = useState(experiencia.url_grabacion ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await run(async () => {
      const updated = await experienciasService.actualizar(experiencia.id, {
        titulo, descripcion, area, modalidad, fecha,
        duracion_minutos: duracion,
        cupos_totales: cupos,
        anios_recomendados: anios,
        url_grabacion: urlGrabacion || undefined,
      }, token)
      onUpdated(updated)
    })
  }

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all'
  const labelClass = 'text-sm font-semibold text-gray-700 block mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="text-lg font-bold text-gray-900">
          Editar experiencia
        </h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-sm font-medium">
          Cancelar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Título *</label>
          <input className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-none`}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
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
          <select className={inputClass} value={modalidad} onChange={(e) => setModalidad(e.target.value as typeof modalidad)}>
            {MODALIDADES.map((m) => <option key={m} className="capitalize">{m}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Fecha *</label>
          <input type="datetime-local" className={inputClass} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>

        <div>
          <label className={labelClass}>Duración (min) *</label>
          <input type="number" className={inputClass} value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} min={1} />
        </div>

        <div>
          <label className={labelClass}>Cupos totales *</label>
          <input type="number" className={inputClass} value={cupos} onChange={(e) => setCupos(Number(e.target.value))} min={1} />
        </div>

        <div>
          <label className={labelClass}>Años recomendados</label>
          <input className={inputClass} value={anios} onChange={(e) => setAnios(e.target.value)} placeholder="Ej: 3ro a 6to año" />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>URL de grabación (opcional)</label>
          <input type="url" className={inputClass} value={urlGrabacion} onChange={(e) => setUrlGrabacion(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
