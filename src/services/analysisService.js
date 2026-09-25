import { mockAnalysis } from '../data/mockData'

// This boundary intentionally returns fixture data until IBM Bob analysis is connected.
export async function analyzeChange(input) {
  await new Promise((resolve) => setTimeout(resolve, 900))
  return { ...mockAnalysis, repository: input.repository, branch: input.branch, change: input.change || mockAnalysis.change }
}

export async function getAnalysis(id) {
  await new Promise((resolve) => setTimeout(resolve, 350))
  return { ...mockAnalysis, id }
}
