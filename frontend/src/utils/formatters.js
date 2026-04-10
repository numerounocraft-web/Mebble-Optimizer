export function formatScore(score) {
  return `${Math.round(score)}%`
}

export function scoreColor(score) {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 75) return 'text-blue-600'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

export function scoreBarColor(score) {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 75) return 'bg-blue-500'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-500'
}

export function categoryBadgeColor(category) {
  const map = {
    Excellent: 'bg-emerald-100 text-emerald-800',
    Great: 'bg-blue-100 text-blue-800',
    Good: 'bg-amber-100 text-amber-800',
    Poor: 'bg-red-100 text-red-800',
  }
  return map[category] ?? 'bg-gray-100 text-gray-800'
}
