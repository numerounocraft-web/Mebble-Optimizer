import { useState, useCallback } from 'react'
import { analyzeResume } from '../services/api'

export function useAnalysis() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = useCallback(async (file, jobDescription) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await analyzeResume(file, jobDescription)
      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error || 'Analysis failed. Please try again.')
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { result, loading, error, analyze, reset }
}
