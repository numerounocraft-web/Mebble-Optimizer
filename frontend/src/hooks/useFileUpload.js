import { useState, useCallback } from 'react'
import { validateFile } from '../utils/validators'

export function useFileUpload() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleFile = useCallback((selectedFile) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return false
    }
    setError(null)
    setFile(selectedFile)
    return true
  }, [])

  const clearFile = useCallback(() => {
    setFile(null)
    setError(null)
  }, [])

  return { file, error, handleFile, clearFile }
}
