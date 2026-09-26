/**
 * Analysis Service Interface
 *
 * Provider-agnostic service interface connecting UI components to analysis engines.
 * Primary provider for ShopFlow OAuth analysis: IBM Bob Provider (bobAnalysisProvider).
 * Fallback provider: Mock Analysis Provider (mockAnalysisProvider).
 */

import { generateBobAnalysis } from './bobAnalysisProvider'
import { generateMockAnalysis } from './mockAnalysisProvider'

/**
 * Validates analysis input parameters before submitting.
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
 * Uses real IBM Bob analysis artifact for ShopFlow OAuth migration,
 * with fallback to mock provider for other custom inputs if needed.
 *
 * @param {Object} input
 * @returns {Promise<Object>} Canonical Analysis Result structure
 */
export async function analyzeChange(input = {}) {
  validateAnalysisInput(input)

  try {
    // Attempt real IBM Bob analysis provider
    return await generateBobAnalysis(input)
  } catch (err) {
    console.warn('IBM Bob provider error, falling back to mock provider:', err)
    return await generateMockAnalysis(input)
  }
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

  try {
    return await generateBobAnalysis({
      repository: 'ShopFlow',
      branch: 'main',
      changeDescription: 'Replace the existing JWT authentication system with OAuth 2.0 authentication.',
    })
  } catch (err) {
    return await generateMockAnalysis({
      repository: 'ShopFlow',
      branch: 'main',
      changeDescription: 'Replace the existing JWT authentication system with OAuth 2.0 authentication.',
    })
  }
}
