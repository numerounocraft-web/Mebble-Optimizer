import { useState, useEffect, useRef } from 'react'
import { parseResume } from '../services/api'

export function useResumeParser(file) {
  const [sections, setSections] = useState(null)
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastFileRef = useRef(null)

  useEffect(() => {
    if (!file || file === lastFileRef.current) return
    lastFileRef.current = file

    setLoading(true)
    setError(null)
    setSections(null)

    parseResume(file)
      .then(data => {
        if (data.success) {
          setSections(data.sections)
          setRawText(data.raw_text || '')
        } else {
          setError(data.error || 'Could not parse resume.')
        }
      })
      .catch(() => setError('Could not parse resume.'))
      .finally(() => setLoading(false))
  }, [file])

  function updateSection(sectionId, newContent) {
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, content: newContent } : s)
    )
  }

  return { sections, rawText, loading, error, updateSection }
}
