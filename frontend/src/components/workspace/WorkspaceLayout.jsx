import { useState } from 'react'
import ResumePreview from './ResumePreview'
import JobDescriptionTab from './JobDescriptionTab'
import ResultsTab from './ResultsTab'
import { validateJobDescription } from '../../utils/validators'
import { downloadReport } from '../../services/api'

export default function WorkspaceLayout({ file, result, loading, error, onAnalyze, onReset }) {
  const [jobDescription, setJobDescription] = useState('')
  const [jdError, setJdError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  function handleAnalyze() {
    const err = validateJobDescription(jobDescription)
    if (err) { setJdError(err); return }
    setJdError(null)
    onAnalyze(file, jobDescription)
  }

  async function handleDownload() {
    if (!result) return
    setDownloading(true)
    try {
      const response = await downloadReport(result)
      const blob = new Blob([response.report], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume-optimization-report.md'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left tab: Job Description */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-sm font-semibold text-gray-700">Job Description</span>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-violet-600 transition-colors"
          >
            ← New resume
          </button>
        </div>
        <JobDescriptionTab
          value={jobDescription}
          onChange={setJobDescription}
          error={jdError || error}
          onAnalyze={handleAnalyze}
          loading={loading}
        />
      </div>

      {/* Middle: Resume preview */}
      <div className="flex-1 flex flex-col bg-gray-200 border-r border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ResumePreview file={file} />
        </div>
      </div>

      {/* Right tab: ATS Results */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-gray-700">ATS Results</span>
        </div>
        <ResultsTab
          result={result}
          loading={loading}
          onDownload={handleDownload}
          downloading={downloading}
        />
      </div>
    </div>
  )
}
