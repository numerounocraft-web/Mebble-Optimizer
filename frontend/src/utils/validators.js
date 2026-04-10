export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_JD_LENGTH = 10000

export function validateFile(file) {
  if (!file) return 'Please select a file.'
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are supported.'
  if (file.size > MAX_FILE_SIZE) return 'File must be under 5MB.'
  return null
}

export function validateJobDescription(text) {
  if (!text || !text.trim()) return 'Job description is required.'
  if (text.trim().length < 50) return 'Job description seems too short. Please paste the full description.'
  return null
}
