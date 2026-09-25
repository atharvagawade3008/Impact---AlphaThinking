/**
 * Analysis Service Interface
 *
 * The analysis service is intentionally provider-agnostic.
 * The current implementation uses mock data via mockAnalysisProvider.
 * A future IBM Bob-powered provider should return the same canonical analysis result structure.
 */

import { generateMockAnalysis } from './mockAnalysisProvider'

/**
 * Validates analysis input parameters before submitting.
 *
 * @param {Object} input
 * @throws {Error} If required parameters are missing or invalid.
 */
function validateAnalysisInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Analysis input must be a valid object.')
  }

  const repo = input.repository
  if (!repo || !String(repo).trim()) {
    throw new Error('Repository is required for change analysis.')
  }

  const branch = input.branch
  if (!branch || !String(branch).trim()) {
    throw new Error('Branch is required for change analysis.')
  }

  const description = input.changeDescription || input.change
  if (!description || !String(description).trim()) {
    throw new Error('Proposed change description is required for analysis.')
  }
}

/**
 * Analyzes a proposed code change asynchronously.
 *
 * Expected input structure:
 * {
 *   repository: string (required),
 *   branch: string (required),
 *   changeDescription: string (required),
 *   pullRequest?: string,
 *   commit?: string,
 *   context?: string
 * }
 *
 * @param {Object} input
 * @returns {Promise<Object>} Canonical Analysis Result structure
 */
export async function analyzeChange(input = {}) {
  // Validate input parameters
  validateAnalysisInput(input)

  // Currently dispatches to mockAnalysisProvider.
  // FUTURE IBM BOB INTEGRATION POINT:
  // return await ibmBobAnalysisProvider.analyze(input);
  return await generateMockAnalysis(input)
}

/**
 * Retrieves an existing analysis by ID asynchronously.
 *
 * @param {string|number} id
 * @returns {Promise<Object>} Canonical Analysis Result structure
 */
export async function getAnalysis(id) {
  if (!id) {
    throw new Error('Analysis ID is required to retrieve result.')
  }

  return await generateMockAnalysis({
    repository: 'ShopFlow',
    branch: 'feature/oauth-migration',
    changeDescription: 'Replace the existing email/password authentication flow with OAuth 2.0 authentication.',
  })
}
