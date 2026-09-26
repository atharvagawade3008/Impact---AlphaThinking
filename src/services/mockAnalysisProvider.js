import { changeScenarios, getScenarioById } from '../data/changeScenarios'
import { getRepositoryById } from '../data/repositories'

const SHOPFLOW_FILE_DESCRIPTIONS = {
  '.env.example': 'Configures environment variables including JWT secrets, port settings, and DB paths',
  'src/controllers/authController.js': 'HTTP request handlers for user registration and login endpoints',
  'src/routes/authRoutes.js': 'Defines Express router endpoints for authentication (/api/auth)',
  'src/services/authService.js': 'Business logic for user registration, password hashing, and token issuance',
  'src/middleware/authMiddleware.js': 'Express middleware extracting and validating Bearer tokens on protected routes',
  'src/utils/jwt.js': 'Utility functions for signing and verifying JWT authentication tokens',
  'src/routes/userRoutes.js': 'Protected user profile router endpoints (/api/users)',
  'src/routes/orderRoutes.js': 'Protected order management and checkout router endpoints (/api/orders)',
  'src/routes/paymentRoutes.js': 'Protected payment processing and refund router endpoints (/api/payments)',
  'tests/helpers.js': 'Test suite harness providing auth headers and database reset helpers',
  'tests/auth.test.js': 'Unit and integration tests for authentication endpoints and token verification',
  'tests/integration.test.js': 'End-to-end API integration tests across auth, user, order, and payment flows',
  'tests/orders.test.js': 'Integration tests for order placement, stock decrement, and order retrieval',
  'tests/payments.test.js': 'Integration tests for payment authorization, status updates, and refunds',
  'src/models/userModel.js': 'Data access model executing SQLite queries on the users table',
  'src/models/productModel.js': 'Data access model for product catalog queries and inventory updates',
  'src/models/orderModel.js': 'Data access model for order creation, line items, and status transitions',
  'src/models/paymentModel.js': 'Data access model for payment transaction records and refund state',
  'src/services/productService.js': 'Business logic for product listing, retrieval, and inventory checks',
  'src/services/orderService.js': 'Business logic for order validation, item pricing, and transactional stock decrement',
  'src/services/paymentService.js': 'Business logic for invoking payment providers and managing payment status',
  'src/controllers/productController.js': 'HTTP request handlers for product catalog endpoints (/api/products)',
  'src/controllers/orderController.js': 'HTTP request handlers for order creation and history endpoints',
  'src/controllers/paymentController.js': 'HTTP request handlers for payment processing and refund requests',
  'src/providers/mockPaymentProvider.js': 'Mock payment gateway provider simulating authorization and refund responses',
  'src/db/schema.sql': 'SQLite schema definitions for users, products, orders, order_items, and payments',
  'src/config/database.js': 'Database initialization and connection pool configuration for SQLite',
  'package.json': 'Project manifest declaring Express, sqlite3, jsonwebtoken, and bcryptjs dependencies',
  'package-lock.json': 'Locked dependency tree manifest',
  'tests/products.test.js': 'Integration test suite for product catalog listing and price queries',
}

/**
 * Finds the closest matching ground-truth scenario from change input
 * @param {Object} input
 * @returns {Object} Ground truth scenario object
 */
function findMatchingScenario(input) {
  if (input.scenarioId) {
    return getScenarioById(input.scenarioId)
  }

  const desc = (input.changeDescription || input.change || '').toLowerCase()

  if (desc.includes('oauth') || desc.includes('jwt')) return changeScenarios[0]
  if (desc.includes('hash') || desc.includes('password') || desc.includes('bcrypt')) return changeScenarios[1]
  if (desc.includes('role') || desc.includes('authorization') || desc.includes('admin')) return changeScenarios[2]
  if (desc.includes('price') || desc.includes('pricing') || desc.includes('discount')) return changeScenarios[3]
  if (desc.includes('inventory') || desc.includes('stock') || desc.includes('reservation')) return changeScenarios[4]
  if (desc.includes('processing') || desc.includes('provider') || desc.includes('payment flow')) return changeScenarios[5]
  if (desc.includes('refund') || desc.includes('partial')) return changeScenarios[6]
  if (desc.includes('status') || desc.includes('workflow') || desc.includes('transition')) return changeScenarios[7]

  return changeScenarios[0]
}

/**
 * Generates canonical analysis result for ShopFlow or current selected repository
 * @param {Object} input
 * @returns {Promise<Object>} Canonical analysis result structure
 */
export async function generateMockAnalysis(input = {}) {
  // Simulate network & AI processing delay (~1.4s)
  await new Promise((resolve) => setTimeout(resolve, 1400))

  const repoConfig = getRepositoryById(input.repository || 'shopflow')
  const scenario = findMatchingScenario(input)

  const analyzedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const branch = input.branch || repoConfig.branch
  const changeDescription = input.changeDescription || input.change || scenario.changeDescription
  const pullRequest = input.pullRequest || input.pr || undefined
  const commit = input.commit || undefined
  const context = input.context || scenario.defaultContext

  const totalAffectedCount = scenario.directlyAffectedFiles.length + scenario.indirectlyAffectedFiles.length

  const files = [
    ...scenario.directlyAffectedFiles.map((file) => [
      file,
      'Directly Affected',
      'High',
      SHOPFLOW_FILE_DESCRIPTIONS[file] || 'Directly impacted by proposed code modification',
    ]),
    ...scenario.indirectlyAffectedFiles.map((file) => [
      file,
      'Indirectly Affected',
      file.startsWith('tests/') ? 'High' : 'Medium',
      SHOPFLOW_FILE_DESCRIPTIONS[file] || 'Downstream component or test harness affected by change contract',
    ]),
  ]

  const risks = scenario.riskAreas.map((riskArea, index) => {
    const isHigh = index < 2
    const targetFile = scenario.directlyAffectedFiles[index % scenario.directlyAffectedFiles.length] || 'ShopFlow core'
    return {
      id: `risk-${index + 1}`,
      title: `Potential risk: ${riskArea}`,
      severity: isHigh ? 'High' : 'Medium',
      status: isHigh ? 'High' : 'Medium',
      score: Math.max(88 - index * 12, 48),
      tone: isHigh ? 'red' : 'amber',
      area: scenario.affectedModules[index % scenario.affectedModules.length],
      affectedArea: `${scenario.affectedModules[index % scenario.affectedModules.length]} (${targetFile})`,
      description: `Potential risk associated with ${riskArea} when implementing "${scenario.title}". Requires verification before merging into ${branch}.`,
      mitigation: `Audit ${targetFile} and execute targeted regression tests in ${scenario.affectedTests[0] || 'test suite'}.`,
    }
  })

  const tests = scenario.recommendedTests.map((recTest, index) => {
    const isP0 = index < 3 || index === scenario.recommendedTests.length - 1
    const testFile = scenario.affectedTests[index % scenario.affectedTests.length]
    const component = scenario.directlyAffectedFiles[index % scenario.directlyAffectedFiles.length]
    return {
      id: `test-${index + 1}`,
      name: recTest,
      type: index === 0 ? 'Integration Test' : index === 1 ? 'Unit Test' : index === 2 ? 'Security Test' : 'E2E Test',
      priority: isP0 ? 'P0' : 'P1',
      component,
      affectedArea: scenario.affectedModules[index % scenario.affectedModules.length],
      status: 'Not verified',
      reason: `Recommended test for ${scenario.title}. Validates behavior covered by ${testFile}.`,
      testFile,
    }
  })

  const canonicalResult = {
    id: `impact-${repoConfig.id}-${scenario.id.toLowerCase()}`,
    repository: repoConfig.name,
    repositoryId: repoConfig.id,
    branch,
    technology: repoConfig.technology,
    changeDescription,
    changeSummary: changeDescription,
    change: changeDescription,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    timestamp: analyzedAt,
    overallRisk: 'High',
    readinessStatus: 'REVIEW NEEDED',
    verificationStatus: `0/${tests.length} verified (Not yet executed)`,

    summary: [
      ['Files likely affected', `${totalAffectedCount}`, `${scenario.directlyAffectedFiles.length} direct, ${scenario.indirectlyAffectedFiles.length} indirect`],
      ['Files currently changed', '0', 'proposed change - uncommitted'],
      ['Modules affected', `${scenario.affectedModules.length}`, scenario.affectedModules.join(', ')],
      ['Tests recommended', `${tests.length}`, `across ${scenario.affectedTests.length} test files`],
    ],

    files,

    impactMap: {
      change: scenario.title,
      nodes: [
        { label: 'Proposed Change', value: scenario.title, tone: 'cyan' },
        { label: 'Direct Files', value: scenario.directlyAffectedFiles.slice(0, 2).map((f) => f.split('/').pop()).join(' · '), tone: 'blue' },
        { label: 'Affected Modules', value: scenario.affectedModules.slice(0, 3).join(' · '), tone: 'amber' },
        { label: 'Affected APIs', value: `${scenario.affectedAPIs.length} Endpoints`, tone: 'amber' },
        { label: 'Recommended Tests', value: `${tests.length} Tests (${scenario.affectedTests.length} files)`, tone: 'green', last: true },
      ],
    },

    dependencyPropagation: [
      {
        level: 'Level 1',
        badgeTone: 'cyan',
        title: 'Directly Affected Files',
        description: scenario.directlyAffectedFiles.join(', '),
      },
      {
        level: 'Level 2',
        badgeTone: 'blue',
        title: 'Affected Modules & Middleware',
        description: scenario.affectedModules.join(', '),
      },
      {
        level: 'Level 3',
        badgeTone: 'amber',
        title: 'Affected API Endpoints',
        description: scenario.affectedAPIs.slice(0, 4).join(', ') + (scenario.affectedAPIs.length > 4 ? ` (+${scenario.affectedAPIs.length - 4} more)` : ''),
      },
      {
        level: 'Level 4',
        badgeTone: 'green',
        title: 'Affected Test Harness & Suites',
        description: scenario.affectedTests.join(', '),
      },
    ],

    risks,
    tests,

    releaseReadiness: {
      status: 'REVIEW NEEDED',
      summary: `High architecture and security risk for "${scenario.title}" requires validation of affected ShopFlow modules.`,
      summaryText: `High architecture and security risk for "${scenario.title}" requires validation of affected ShopFlow modules.`,
      executionStatus: 'Not yet verified',
      verifiedCount: 0,
      totalTestsCount: tests.length,
      blockers: [
        `Proposed change "${scenario.title}" has not been executed or verified against test suites.`,
        `Contract validation pending for affected APIs (${scenario.affectedAPIs.slice(0, 3).join(', ')}).`,
      ],
      recommendedActions: [
        `Execute recommended test suites (${scenario.affectedTests.join(', ')}).`,
        `Verify API contract compatibility for ${scenario.affectedModules.join(', ')} modules.`,
        `Obtain team review on risk areas: ${scenario.riskAreas.slice(0, 2).join(', ')}.`,
      ],
    },

    metadata: {
      analyzedAt,
      analysisSource: 'mock',
      duration: '1.4s',
      pullRequest,
      commit,
      context,
    },
  }

  return canonicalResult
}
