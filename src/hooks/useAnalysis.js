import { useState, useCallback } from 'react'
import { analyzeChange } from '../services/analysisService'

/**
 * Custom hook for executing and managing change analysis state.
 */
export function useAnalysis() {
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = useCallback(async (input) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await analyzeChange(input)
      setAnalysis(result)
      return result
    } catch (err) {
      const errorMsg = err?.message || 'Failed to analyze change.'
      console.error('Analysis error:', err)
      setError(errorMsg)
      // Do NOT rethrow — callers read the error state; rethrowing crashes React render tree
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetAnalysis = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    analysis,
    isLoading,
    error,
    analyze,
    resetAnalysis,
  }
}

export default useAnalysis
