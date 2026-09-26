import groundTruth from '../../shopflow-demo/docs/change-impact-ground-truth.json'

/**
 * Centralized ShopFlow Change Scenarios Data Source
 * Sourced directly from ShopFlow/docs/change-impact-ground-truth.json
 */
export const changeScenarios = groundTruth.scenarios.map((scenario) => ({
  ...scenario,
  defaultContext: getScenarioDefaultContext(scenario.id),
}))

function getScenarioDefaultContext(scenarioId) {
  switch (scenarioId) {
    case 'SCN-001':
      return 'Preserve the identity contract consumed by protected routes across user, order, and payment services.'
    case 'SCN-002':
      return 'Ensure existing stored hashes remain verifiable or are transparently migrated upon user login.'
    case 'SCN-003':
      return 'Enforce customer and admin access controls on protected endpoint groups without breaking public routes.'
    case 'SCN-004':
      return 'Ensure cart order line item price snapshots match payment authorization totals.'
    case 'SCN-005':
      return 'Maintain stock allocation atomicity inside SQLite database transactions during concurrent checkouts.'
    case 'SCN-006':
      return 'Ensure idempotent payment processing and state synchronization with order records.'
    case 'SCN-007':
      return 'Track cumulative partial refund amounts up to the original payment charge limit.'
    case 'SCN-008':
      return 'Enforce legal state transitions for pending, paid, shipped, and refunded order lifecycle states.'
    default:
      return 'Ensure all affected modules and API contracts remain backward compatible.'
  }
}

/**
 * Get scenario by ID
 * @param {string} id
 * @returns {Object}
 */
export function getScenarioById(id) {
  return changeScenarios.find((s) => s.id === id) || changeScenarios[0]
}

/**
 * Get default scenario (SCN-001 OAuth)
 * @returns {Object}
 */
export function getDefaultScenario() {
  return changeScenarios[0]
}
