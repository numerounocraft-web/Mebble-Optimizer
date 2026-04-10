import { scoreBarColor } from '../../utils/formatters'

export default function ScoreProgressBar({ score }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}
