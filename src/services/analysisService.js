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
  repository = 'ShopFlow',
  branch = 'feature/oauth-migration',
  changeDescription,
  change,
  pr,
  context,
} = {}) {
  const description = changeDescription || change || mockAnalysis.change

  // Simulate network & AI processing delay for mock backend execution (~2.2s)
  await new Promise((resolve) => setTimeout(resolve, 2200))

  return {
    ...mockAnalysis,
    id: `impact-2026-oauth-01`,
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
