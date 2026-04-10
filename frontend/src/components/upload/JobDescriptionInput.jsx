import { MAX_JD_LENGTH } from '../../utils/validators'

export default function JobDescriptionInput({ value, onChange, error }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Job Description</label>
        <span className="text-xs text-gray-400">{value.length} / {MAX_JD_LENGTH.toLocaleString()}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_JD_LENGTH))}
        placeholder="Paste the full job description here..."
        rows={10}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
