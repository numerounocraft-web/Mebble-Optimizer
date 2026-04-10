import Card from '../common/Card'
import ScoreProgressBar from './ScoreProgressBar'
import { formatScore, scoreColor, categoryBadgeColor } from '../../utils/formatters'

export default function ATSScoreDisplay({ score, category }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">ATS Score</h2>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryBadgeColor(category)}`}>
          {category}
        </span>
      </div>
      <div className={`text-5xl font-bold mb-4 ${scoreColor(score)}`}>
        {formatScore(score)}
      </div>
      <ScoreProgressBar score={score} />
      <p className="text-xs text-gray-400 mt-3">
        Based on keyword overlap with the job description
      </p>
    </Card>
  )
}
