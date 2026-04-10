import Button from '../common/Button'
import { MAX_JD_LENGTH } from '../../utils/validators'

export default function JobDescriptionTab({ value, onChange, error, onAnalyze, loading }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden p-4 gap-4">
      <div className="flex flex-col flex-1 gap-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Paste job description
          </label>
          <span className="text-xs text-gray-400">
            {value.length} / {MAX_JD_LENGTH.toLocaleString()}
          </span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_JD_LENGTH))}
          placeholder="Paste the full job description here..."
          className={`flex-1 w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <Button
        onClick={onAnalyze}
        disabled={loading}
        className="w-full py-3"
      >
        {loading ? 'Analyzing...' : 'Analyze Resume'}
      </Button>
    </div>
  )
}
