import { useState, useCallback } from 'react'
import { fetchScenarios, askScenarioQuestion } from '../api/scenarioApi'

export function useScenario() {
  const [file,        setFile]        = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [qaLoading,   setQaLoading]   = useState(false)
  const [scenarios,   setScenarios]   = useState([])
  const [chunks,      setChunks]      = useState([])
  const [error,       setError]       = useState(null)
  const [chatHistory, setChatHistory] = useState([])

  const generate = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setScenarios([])
    setChunks([])
    setChatHistory([])
    try {
      const data = await fetchScenarios(file)
      setScenarios(data.scenarios || [])
      setChunks(data.chunks || [])
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to generate scenarios')
    } finally {
      setLoading(false)
    }
  }, [file])

  const ask = useCallback(async (question) => {
    if (!question.trim()) return
    setQaLoading(true)
    setChatHistory(h => [...h, { question, answer: null, loading: true }])
    try {
      const data = await askScenarioQuestion(question, chunks)
      setChatHistory(h =>
        h.map((item, i) =>
          i === h.length - 1
            ? { question, answer: data.answer, loading: false }
            : item
        )
      )
    } catch (e) {
      const errMsg = e?.response?.data?.detail || e.message || 'Failed to get answer'
      setChatHistory(h =>
        h.map((item, i) =>
          i === h.length - 1
            ? { question, answer: `Error: ${errMsg}`, loading: false, isError: true }
            : item
        )
      )
    } finally {
      setQaLoading(false)
    }
  }, [chunks])

  const reset = useCallback(() => {
    setFile(null)
    setScenarios([])
    setChunks([])
    setChatHistory([])
    setError(null)
  }, [])

  return {
    file, setFile,
    loading, qaLoading,
    scenarios, chunks,
    chatHistory,
    error,
    generate, ask, reset,
    hasScenarios: scenarios.length > 0,
  }
}