import { mockAnalysis } from '../data/mockData'

/**
 * Clean interface for change analysis.
 * Can be swapped with real IBM Bob / backend service seamlessly.
 *
 * @param {Object} params
 * @param {string} params.repository
 * @param {string} params.branch
 * @param {string} [params.changeDescription]
 * @param {string} [params.change]
 * @param {string} [params.pr]
 * @param {string} [params.context]
 * @returns {Promise<Object>} Consistent analysis result structure
 */
export async function analyzeChange({
  repository = 'platform / identity-service',
  branch = 'develop',
  changeDescription,
  change,
  pr,
  context,
} = {}) {
  const description = changeDescription || change || mockAnalysis.change

  // Simulate network delay for mock backend execution
  await new Promise((resolve) => setTimeout(resolve, 900))

  return {
    ...mockAnalysis,
    id: `impact-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    repository,
    branch,
    change: description,
    pr: pr || undefined,
    context: context || undefined,
  }
}

/**
 * Retrieve existing analysis by ID.
 *
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export async function getAnalysis(id) {
  await new Promise((resolve) => setTimeout(resolve, 350))
  return { ...mockAnalysis, id }
}
