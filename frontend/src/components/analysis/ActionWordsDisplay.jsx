import Card from '../common/Card'

export default function ActionWordsDisplay({ found, suggestions }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Action Words Analysis</h3>

      {found.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Found in your resume</p>
          <div className="flex flex-wrap gap-2">
            {found.map((word) => (
              <span key={word} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 ? (
        <div>
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">Suggested improvements</p>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-sm font-medium text-gray-600 line-through">{s.current}</span>
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-sm font-semibold text-amber-800">{s.suggested}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No weak action words detected. Well done!</p>
      )}
    </Card>
  )
}
