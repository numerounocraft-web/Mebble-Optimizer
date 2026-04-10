import Card from '../common/Card'

export default function SummaryCard({ summary }) {
  return (
    <Card className="bg-violet-50 border-violet-100">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-violet-900 leading-relaxed">{summary}</p>
      </div>
    </Card>
  )
}
