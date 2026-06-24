'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '../services/authService'
import { useFormState } from '../hooks/useFormState'
import { createClient } from '../lib/supabase'

export function RegisterEmpresaForm() {
  const router = useRouter()
  const { loading, error, run } = useFormState()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [documento, setDocumento] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await run(async () => {
      let documentoUrl: string | undefined

      if (documento) {
        setUploadProgress('Subiendo documento...')
        const supabase = createClient()
        const ext = documento.name.split('.').pop()
        const path = `empresas/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('empresa-documentos')
          .upload(path, documento, { upsert: false })

        if (uploadError) {
          throw new Error('Error al subir el documento: ' + uploadError.message)
        }

        const { data: urlData } = supabase.storage
          .from('empresa-documentos')
          .getPublicUrl(path)

        documentoUrl = urlData.publicUrl
        setUploadProgress(null)
      }

      const { token } = await authService.register({
        email,
        password,
        fullName,
        role: 'empresa',
        documentoUrl,
      })
      localStorage.setItem('inspira_token', token)
      router.push('/dashboard/empresa')
    })
  }

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400'

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1
          style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Cuenta de Empresa
        </h1>
        <p className="text-gray-500">Compartí tu experiencia con la próxima generación.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nombre de la empresa / Profesional</label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Globant / Juan Pérez Arq."
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email de contacto</label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="empresa@contacto.com"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Contraseña</label>
          <div className="relative">
            <input
              className={inputClass}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Documentación de verificación
            <span className="text-gray-400 font-normal ml-1">(opcional pero recomendado)</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Subí un documento que acredite la existencia de tu empresa (constancia AFIP, certificado, etc.). El admin lo revisará para habilitarte.
          </p>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
            <div className="flex flex-col items-center justify-center pt-4 pb-4">
              {documento ? (
                <>
                  <span className="text-lg">📄</span>
                  <p className="text-sm text-indigo-600 font-medium mt-1 truncate max-w-[200px]">{documento.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(documento.size / 1024).toFixed(0)} KB</p>
                </>
              ) : (
                <>
                  <span className="text-2xl text-gray-300">⬆</span>
                  <p className="text-sm text-gray-400 mt-1">Hacé clic para subir</p>
                  <p className="text-xs text-gray-300 mt-0.5">PDF, JPG, PNG (máx. 5 MB)</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f && f.size <= 5 * 1024 * 1024) setDocumento(f)
                else if (f) alert('El archivo no puede superar 5 MB')
              }}
            />
          </label>
          {documento && (
            <button
              type="button"
              onClick={() => setDocumento(null)}
              className="text-xs text-red-400 hover:text-red-600 mt-1"
            >
              Quitar archivo
            </button>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
          Tu cuenta quedará <strong>pendiente de revisión</strong>. Un administrador validará tu empresa y te habilitará para publicar experiencias.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? (uploadProgress ?? 'Creando cuenta...') : 'Crear perfil de empresa'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
