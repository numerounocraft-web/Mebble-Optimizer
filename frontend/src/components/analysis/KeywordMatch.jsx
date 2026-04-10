import Card from '../common/Card'

function KeywordPill({ word, variant }) {
  const styles = {
    matched: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    missing: 'bg-red-50 text-red-700 border border-red-200',
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {word}
    </span>
  )
}

export default function KeywordMatch({ matched, missing }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold text-gray-700">Matched Keywords</h3>
          <span className="ml-auto text-xs text-gray-400">{matched.length}</span>
        </div>
        {matched.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matched.map((kw) => <KeywordPill key={kw} word={kw} variant="matched" />)}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No matching keywords found.</p>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <h3 className="text-sm font-semibold text-gray-700">Missing Keywords</h3>
          <span className="ml-auto text-xs text-gray-400">{missing.length}</span>
        </div>
        {missing.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missing.map((kw) => <KeywordPill key={kw} word={kw} variant="missing" />)}
          </div>
        ) : (
          <p className="text-sm text-emerald-600 font-medium">No missing keywords — great match!</p>
        )}
      </Card>
    </div>
  )
}
