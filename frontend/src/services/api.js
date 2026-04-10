import axios from 'axios'

const BASE_URL = '/api'

export async function analyzeResume(file, jobDescription) {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('job_description', jobDescription)

  const response = await axios.post(`${BASE_URL}/analyze`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function downloadReport(analysisData) {
  const response = await axios.post(`${BASE_URL}/report`, analysisData)
  return response.data
}

export async function healthCheck() {
  const response = await axios.get(`${BASE_URL}/health`)
  return response.data
}
