/**
 * Centralized Repository Configuration Registry
 *
 * Designed to be repository-agnostic so that replacement repositories
 * (such as Manav's repository in the future) can be added or substituted
 * without modifying UI components.
 */

export const repositories = [
  {
    id: 'shopflow',
    name: 'ShopFlow',
    description: 'Modular Express & SQLite e-commerce REST API backend demo target for IMPACT',
    branch: 'main',
    technology: ['Node.js', 'Express', 'JavaScript', 'SQLite'],
    modules: ['Authentication', 'Middleware', 'Users', 'Products', 'Orders', 'Payments', 'Database'],
    testFramework: 'Jest / Supertest',
    defaultScenarioId: 'SCN-001',
  },
]

/**
 * Get repository configuration by ID or name
 * @param {string} id
 * @returns {Object}
 */
export function getRepositoryById(id) {
  if (!id) return repositories[0]
  const normalized = String(id).toLowerCase().trim()
  return (
    repositories.find(
      (repo) => repo.id.toLowerCase() === normalized || repo.name.toLowerCase() === normalized
    ) || repositories[0]
  )
}

/**
 * Get the active default repository configuration
 * @returns {Object}
 */
export function getDefaultRepository() {
  return repositories[0]
}
