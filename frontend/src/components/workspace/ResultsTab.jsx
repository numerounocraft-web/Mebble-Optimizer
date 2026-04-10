import Loader from '../common/Loader'
import ATSScoreDisplay from '../analysis/ATSScoreDisplay'
import KeywordMatch from '../analysis/KeywordMatch'
import ActionWordsDisplay from '../analysis/ActionWordsDisplay'
import SummaryCard from '../analysis/SummaryCard'
import Button from '../common/Button'

export default function ResultsTab({ result, loading, onDownload, downloading }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Paste a job description on the left and click <strong>Analyze Resume</strong> to see your ATS score.
        </p>
      </div>
    )
  }

  const domainLabel = result.domain
    ? result.domain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">
      {domainLabel && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Detected field</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
            {domainLabel}
          </span>
        </div>
      )}
      <SummaryCard summary={result.summary} />
      <ATSScoreDisplay score={result.ats_score} category={result.score_category} />
      <KeywordMatch matched={result.matched_keywords} missing={result.missing_keywords} />
      <ActionWordsDisplay
        found={result.action_words_analysis.found}
        suggestions={result.action_words_analysis.suggestions}
      />
      <Button onClick={onDownload} disabled={downloading} variant="secondary" className="w-full">
        {downloading ? 'Downloading...' : 'Download Report'}
      </Button>
    </div>
  )
}
