'use client'

/**
 * Hook personalizado para manejar la lógica de un formulario genérico.
 * Provee loading, error y un wrapper para async handlers.
 */

import { useState, useCallback } from 'react'

interface UseFormState {
  loading: boolean
  error: string
  success: string
}

export function useFormState() {
  const [state, setState] = useState<UseFormState>({
    loading: false,
    error: '',
    success: '',
  })

  const run = useCallback(async (fn: () => Promise<void>) => {
    setState({ loading: true, error: '', success: '' })
    try {
      await fn()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setState((s) => ({ ...s, loading: false, error: message }))
      return
    }
    setState((s) => ({ ...s, loading: false }))
  }, [])

  const setSuccess = useCallback((success: string) => {
    setState((s) => ({ ...s, success, error: '' }))
  }, [])

  const setError = useCallback((error: string) => {
    setState((s) => ({ ...s, error, success: '' }))
  }, [])

  return { ...state, run, setSuccess, setError }
}
