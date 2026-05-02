import axiosInstance from './axios'

export async function fetchScenarios(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await axiosInstance.post('/api/scenarios', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  })
  return res.data
}

export async function askScenarioQuestion(question, contextChunks = []) {
  const res = await axiosInstance.post('/api/scenario-question', {
    question,
    context_chunks: contextChunks,
  })
  return res.data
}