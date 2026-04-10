import { useMemo, useEffect } from 'react'

export default function ResumePreview({ file }) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  if (!url) return null

  return (
    <iframe
      src={url}
      title="Resume Preview"
      className="w-full h-full border-0"
    />
  )
}
