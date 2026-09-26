/**
 * Release Readiness Evaluator
 *
 * Provider-independent evaluator that transforms a canonical analysis result into a
 * structured release-readiness decision object.
 *
 * Methodology is defined in docs/bob-release-readiness-assessment.md (Section A–B).
 * Classification categories:
 *   BLOCKING     — concrete structural failure that prevents release regardless of intent
 *   REVIEW_NEEDED — depends on an architectural decision not yet made, or post-impl human review
 *   INFORMATIONAL — scope description, cleanup task, or positive scoping observation
 *
 * IMPORTANT:
 *  - Does NOT invent findings beyond what the analysis provides.
 *  - Does NOT produce a numerical readiness score.
 *  - Does NOT assume tests have been executed.
 *  - Does NOT claim the OAuth migration has been implemented.
 *  - Works with both mock and Bob-derived canonical analysis objects.
 */

// ─── Classification constants ────────────────────────────────────────────────

export const CLASS = {
  BLOCKING: 'BLOCKING',
  REVIEW_NEEDED: 'REVIEW_NEEDED',
  INFORMATIONAL: 'INFORMATIONAL',
}

// ─── Status constants ─────────────────────────────────────────────────────────

export const READINESS_STATUS = {
  NOT_READY: 'NOT READY',
  REVIEW_NEEDED: 'REVIEW NEEDED',
  READY: 'READY',
}

// ─── Bob assessment data ──────────────────────────────────────────────────────
// Sourced directly from docs/bob-release-readiness-assessment.md.
// These are the findings defined by the Bob assessment; they are not invented here.

const BOB_BLOCKERS = [
  {
    id: 'BLOCKER-1',
    title: 'OAuth implementation does not exist',
    sourceRef: 'JSON note field; releaseReadiness.blockers[0]; analysis section 1',
    evidence:
      'All 6 directly affected files (src/utils/jwt.js, src/middleware/authMiddleware.js, ' +
      'src/services/authService.js, src/controllers/authController.js, src/routes/authRoutes.js, ' +
      '.env.example) retain their JWT implementations. No OAuth code has been written. ' +
      'The change cannot be evaluated because it does not yet exist.',
    resolution: 'Complete the implementation of all 6 directly affected files.',
  },
  {
    id: 'BLOCKER-2',
    title: 'request.user.id will be NaN under OAuth (RISK-001)',
    sourceRef: 'RISK-001 in JSON; analysis section 8 Risk 1; analysis section 5 D1',
    evidence:
      'utils/jwt.js line 13 returns id: Number(payload.sub). OAuth providers issue a sub claim ' +
      'that is a non-numeric string (e.g., "google|abc123"). Number("google|abc123") === NaN. ' +
      'The NaN value propagates to paymentService.js line 8 and orderService.js line 46 ' +
      '(order.userId !== userId), causing silent ownership-check failures across the entire ' +
      'Orders and Payments domain.',
    resolution:
      'The new requireAuth must resolve the OAuth sub to a local integer users.id ' +
      'before writing request.user.',
  },
  {
    id: 'BLOCKER-3',
    title: 'password_hash NOT NULL schema constraint prevents OAuth user creation (RISK-003)',
    sourceRef: 'RISK-003 in JSON; analysis section 8 Risk 3; schema.sql line 4; userModel.js line 15',
    evidence:
      'schema.sql line 4: password_hash TEXT NOT NULL. userModel.create line 15 requires passwordHash ' +
      'as a mandatory argument. Any OAuth user provisioning path that does not supply a bcrypt hash ' +
      'produces a SQLite NOT NULL constraint violation — a hard crash, not a graceful error. ' +
      'No schema migration has been created.',
    resolution:
      'Create a schema migration to make password_hash nullable or add an oauth_subject column. ' +
      'Update userModel.create to match.',
  },
  {
    id: 'BLOCKER-4',
    title: 'Test infrastructure is structurally incompatible with post-migration code',
    sourceRef: 'JSON releaseReadiness.blockers[3,4]; analysis section 7 helpers.js and auth.test.js',
    evidence:
      'tests/helpers.js lines 23–29: createTestUser() calls authService.register({email, password}) ' +
      'and returns {token}. After authService changes, createTestUser() no longer returns a usable ' +
      'token and tests/orders.test.js and tests/payments.test.js fail before any assertion runs. ' +
      'tests/auth.test.js asserts POST /api/auth/register and POST /api/auth/login — both ' +
      'endpoints that will not exist in their current form. The suite cannot produce a valid ' +
      'pass/fail signal after the migration.',
    resolution:
      'Rewrite tests/helpers.js token acquisition and tests/auth.test.js for OAuth flows. ' +
      'Update tests/orders.test.js, tests/payments.test.js, tests/integration.test.js.',
  },
  {
    id: 'BLOCKER-5',
    title: 'Zero test coverage of the new OAuth authentication surface',
    sourceRef: 'JSON recommendedTests entries; analysis section 7 "New tests to add"',
    evidence:
      '12 of 13 identified test scenarios either do not exist or will break after the migration. ' +
      'The only surviving valid test file (tests/products.test.js) covers unauthenticated public ' +
      'routes only. The authentication mechanism and all 10 protected API endpoints have no ' +
      'test coverage in the post-migration state.',
    resolution:
      'Write and execute all 12 identified test scenarios. Confirm tests/products.test.js passes.',
  },
]

const BOB_REVIEW_ITEMS = [
  {
    id: 'REV-01',
    title: 'User provisioning strategy (RISK-002)',
    description:
      'Whether users are provisioned eagerly (at OAuth callback) or lazily (on first protected ' +
      'request) is an architectural decision. Eager provisioning resolves the userService.getProfile ' +
      '404 risk; lazy does not. A human must make and document the decision.',
    riskRef: 'RISK-002',
  },
  {
    id: 'REV-02',
    title: 'Existing user credential migration (RISK-004)',
    description:
      'Existing users have bcrypt hashes in the database. Whether they are linked to OAuth identities, ' +
      'asked to re-register, or migrated via account-linking is a product decision. Requires human ' +
      'decision before deployment.',
    riskRef: 'RISK-004',
  },
  {
    id: 'REV-03',
    title: 'Token refresh / session renewal strategy (RISK-005)',
    description:
      'OAuth access tokens typically have shorter lifetimes than the current 1-day JWT. ShopFlow has ' +
      'no refresh-token endpoint. Whether to implement refresh at API level or delegate to a gateway ' +
      'is an architectural decision.',
    riskRef: 'RISK-005',
  },
  {
    id: 'REV-04',
    title: 'requireAuth async correctness (RISK-006)',
    description:
      'After implementation, a human must verify the new requireAuth is declared async, properly ' +
      'awaits the verification call, and forwards rejections via next(error). A forgotten await ' +
      'silently skips verification. Express 5 reduces risk but cannot eliminate incorrect code.',
    riskRef: 'RISK-006',
  },
  {
    id: 'REV-05',
    title: 'Regression verification: userRoutes.js, orderRoutes.js, paymentRoutes.js',
    description:
      'These three route files apply router.use(requireAuth) but are otherwise unchanged. They must ' +
      'be verified end-to-end after implementation to confirm request.user.id propagates correctly ' +
      'to all downstream services.',
    riskRef: null,
  },
  {
    id: 'REV-06',
    title: 'userService.js compatibility with provisioning strategy',
    description:
      'getProfile(userId) throws 404 if the user row is absent. Its behaviour is correct only if ' +
      'provisioning is eager. Must be reviewed against the provisioning decision (REV-01).',
    riskRef: 'RISK-002',
  },
  {
    id: 'REV-07',
    title: 'Partial migration false-positive test risk (RISK-007)',
    description:
      'If utils/jwt.js is left in place during a staged migration, the test suite may pass against ' +
      'the old JWT code while the new OAuth path is untested. The migration process must be reviewed ' +
      'to ensure old code is removed before test results are used as a release signal.',
    riskRef: 'RISK-007',
  },
]

const BOB_INFORMATIONAL = [
  { id: 'INF-01', finding: 'src/utils/jwt.js must be replaced', note: 'Scope description. Expected work item. No independent failure mode.' },
  { id: 'INF-02', finding: 'src/middleware/authMiddleware.js must be rewritten', note: 'Scope description. Correctness of the rewrite is a review concern (REV-04), not a pre-existing failure.' },
  { id: 'INF-03', finding: 'src/services/authService.js loses bcrypt and signToken', note: 'Scope description. Whether userModel.create is still called is flagged as an open design question.' },
  { id: 'INF-04', finding: 'src/controllers/authController.js handlers will be replaced', note: 'Scope description.' },
  { id: 'INF-05', finding: 'src/routes/authRoutes.js endpoints and validation will change', note: 'Scope description.' },
  { id: 'INF-06', finding: '.env.example requires updated environment variables', note: 'Documentation update. No runtime impact from the template file.' },
  { id: 'INF-07', finding: 'package.json: jsonwebtoken and bcryptjs become unused', note: 'Cleanup task. Unused packages do not cause failures. New OAuth packages are a prerequisite for implementation, not a separate failure gate.' },
  { id: 'INF-08', finding: 'Products module is entirely unaffected', note: 'productRoutes.js has no requireAuth dependency. tests/products.test.js is expected to pass without modification.' },
  { id: 'INF-09', finding: 'GET /health, GET /api/products, GET /api/products/:id are unaffected', note: 'Three endpoints have no auth dependency and require no regression testing for this change.' },
  { id: 'INF-10', finding: 'tests/products.test.js requires no changes', note: 'The only test file that remains fully valid after the migration. Records that not all tests are broken.' },
]

const BOB_REQUIRED_ACTIONS = [
  {
    phase: 1,
    phaseTitle: 'Design Decisions',
    phaseNote: 'Must precede code',
    actions: [
      { id: 'H1', action: 'Decide how OAuth sub maps to local users.id (lookup table, stored sub column, or other mechanism). Document the decision.', resolves: 'BLOCKER-2 (RISK-001)' },
      { id: 'H2', action: 'Decide the user provisioning strategy: eager (at OAuth callback) or lazy (on first protected request). Document the decision.', resolves: 'REV-01 (RISK-002)' },
      { id: 'H3', action: 'Decide the credential migration strategy for existing users with password_hash values. Document the decision.', resolves: 'REV-02 (RISK-004)' },
      { id: 'H4', action: 'Decide the token refresh strategy (implement at API level, delegate to API gateway, or accept short-lived access tokens). Document the decision.', resolves: 'REV-03 (RISK-005)' },
    ],
  },
  {
    phase: 2,
    phaseTitle: 'Schema Migration',
    phaseNote: 'Must precede application code changes',
    actions: [
      { id: 'H5', action: 'Create and apply a schema migration that removes or makes nullable the password_hash TEXT NOT NULL constraint, or adds an oauth_subject TEXT UNIQUE column.', resolves: 'BLOCKER-3 (RISK-003)' },
      { id: 'H6', action: 'Update userModel.create to match the new schema.', resolves: 'BLOCKER-3 (I4)' },
    ],
  },
  {
    phase: 3,
    phaseTitle: 'Implementation',
    phaseNote: 'Core OAuth code',
    actions: [
      { id: 'H7', action: 'Rewrite src/utils/jwt.js (or replace it) with OAuth token verification that resolves sub to a local integer users.id.', resolves: 'BLOCKER-1, BLOCKER-2' },
      { id: 'H8', action: 'Rewrite src/middleware/authMiddleware.js (requireAuth) to use the new verification mechanism. Declare it async and verify rejections are forwarded correctly.', resolves: 'BLOCKER-1, REV-04' },
      { id: 'H9', action: 'Rewrite src/services/authService.js to implement the OAuth callback/provisioning flow based on decisions H2 and H3.', resolves: 'BLOCKER-1' },
      { id: 'H10', action: 'Rewrite src/controllers/authController.js with OAuth-specific handlers.', resolves: 'BLOCKER-1' },
      { id: 'H11', action: 'Rewrite src/routes/authRoutes.js with OAuth-specific routes.', resolves: 'BLOCKER-1' },
      { id: 'H12', action: 'Update .env.example with OAuth environment variables; remove JWT_SECRET and JWT_EXPIRES_IN.', resolves: 'INF-06' },
      { id: 'H13', action: 'Update package.json: add OAuth client library; remove jsonwebtoken and bcryptjs if no longer needed.', resolves: 'INF-07' },
    ],
  },
  {
    phase: 4,
    phaseTitle: 'Test Infrastructure Rebuild',
    phaseNote: null,
    actions: [
      { id: 'H14', action: 'Rewrite tests/helpers.js: replace JWT_SECRET override with OAuth test configuration; replace createTestUser() with an OAuth-compatible token acquisition mechanism (mock server or test-key factory).', resolves: 'BLOCKER-4' },
      { id: 'H15', action: 'Rewrite tests/auth.test.js to cover OAuth authorization redirect, callback with valid code, callback with invalid code, token rejection (missing, malformed, expired).', resolves: 'BLOCKER-4, BLOCKER-5' },
      { id: 'H16', action: 'Update tests/orders.test.js, tests/payments.test.js, and tests/integration.test.js to use the new token acquisition from the rewritten helpers.js.', resolves: 'BLOCKER-4' },
      { id: 'H17', action: 'Add new test: cross-user access to an order is rejected with HTTP 404.', resolves: 'BLOCKER-5' },
      { id: 'H18', action: 'Confirm tests/products.test.js passes unchanged.', resolves: 'INF-10' },
    ],
  },
  {
    phase: 5,
    phaseTitle: 'Verification',
    phaseNote: null,
    actions: [
      { id: 'H19', action: 'Execute the full test suite (node --test inside shopflow-demo/). All tests must pass.', resolves: 'BLOCKER-5' },
      { id: 'H20', action: 'Perform a code review of the new requireAuth confirming it is async, the verification call is awaited, and failures are forwarded correctly.', resolves: 'REV-04' },
      { id: 'H21', action: 'Verify end-to-end that request.user.id is an integer matching the local users table after OAuth login.', resolves: 'BLOCKER-2, REV-05' },
      { id: 'H22', action: 'Verify the chosen credential migration strategy has been applied and existing users can still authenticate (or have been formally migrated).', resolves: 'REV-02' },
      { id: 'H23', action: 'Re-run this release-readiness assessment against the post-implementation state.', resolves: 'All' },
    ],
  },
]

const BOB_TEST_READINESS = [
  { domain: 'OAuth auth flow', valid: false, reason: 'tests/auth.test.js tests JWT flows only; OAuth tests have not been written.' },
  { domain: 'Token rejection (missing / malformed / expired)', valid: false, reason: 'Baseline exists in auth.test.js line 29 but breaks when authMiddleware.js is changed. Replacement does not exist.' },
  { domain: 'User profile (GET/PUT /api/users/me)', valid: false, reason: 'Test exists in auth.test.js but uses a JWT token; breaks when auth changes.' },
  { domain: 'Order creation / stock reservation', valid: false, reason: 'tests/orders.test.js uses createTestUser() which calls authService.register; breaks when authService changes.' },
  { domain: 'Order inventory rollback', valid: false, reason: 'Same dependency on createTestUser().' },
  { domain: 'Payment process / retrieve / refund', valid: false, reason: 'tests/payments.test.js uses createTestUser(); breaks when authService changes.' },
  { domain: 'Cross-user ownership rejection', valid: false, reason: 'No dedicated test for this case exists in either the current or post-migration suite.' },
  { domain: 'End-to-end checkout flow', valid: false, reason: 'tests/integration.test.js calls POST /api/auth/register and reads registration.body.token; breaks after migration.' },
  { domain: 'Public product routes (GET /api/products, /api/products/:id)', valid: true, reason: 'tests/products.test.js unchanged. Unauthenticated routes; no change required.' },
]

const BOB_LIMITATIONS = [
  { id: 'J1', text: 'This assessment is based entirely on static analysis. No runtime behaviour has been observed.' },
  { id: 'J2', text: 'The OAuth provider is unknown. If the provider issues numeric sub values, RISK-001 / BLOCKER-2 may not materialise. The provider choice must be confirmed.' },
  { id: 'J3', text: 'No implementation decisions have been made. REVIEW NEEDED findings cannot be resolved by analysis alone.' },
  { id: 'J4', text: 'RISK-004 (existing user credential loss) severity depends on whether real users exist in production. In a demo environment with no real users this has no practical impact.' },
  { id: 'J5', text: 'Test results in Phase 5 may reveal additional findings. A clean test run is necessary but not sufficient for release readiness.' },
  { id: 'J6', text: 'This assessment can only be superseded by a new analysis performed against post-implementation source code.' },
]

// ─── Evaluator ────────────────────────────────────────────────────────────────

/**
 * Evaluates a canonical analysis result and returns a structured release-readiness object.
 *
 * For the Bob-derived OAuth migration analysis (scenarioId === 'SCN-001' / analysisSource === 'IBM Bob'),
 * the full Bob assessment findings are used verbatim.
 *
 * For mock analyses, a simplified assessment is derived from the analysis's own releaseReadiness block.
 *
 * @param {Object} analysis - Canonical analysis result from bobAnalysisProvider or mockAnalysisProvider
 * @returns {Object} Structured release-readiness evaluation
 */
export function evaluateReleaseReadiness(analysis) {
  if (!analysis) return null

  const isBobAnalysis =
    analysis.analysisSource === 'IBM Bob' ||
    analysis.scenarioId === 'SCN-001' ||
    analysis.id?.startsWith('bob-impact')

  if (isBobAnalysis) {
    return buildBobEvaluation(analysis)
  }

  return buildMockEvaluation(analysis)
}

// ─── Bob-specific evaluation (full assessment) ───────────────────────────────

function buildBobEvaluation(analysis) {
  return {
    // Overall status — sourced directly from Bob assessment section D
    status: READINESS_STATUS.NOT_READY,
    statusLabel: 'NOT READY — IMPLEMENTATION NOT STARTED',
    classification: CLASS.BLOCKING,

    // Brief why-statement for the hero section
    summary:
      'The proposed change replaces the core authentication mechanism. ' +
      'No implementation has been performed and no tests have been executed. ' +
      '5 blocking issues, 7 review-required findings, and 10 informational observations are recorded. ' +
      'The change cannot be declared release-ready until all blockers are resolved.',

    // Assessment provenance
    assessmentSource: 'docs/bob-release-readiness-assessment.md',
    analysisSource: 'IBM Bob — static code inspection of shopflow-demo/',
    note: analysis.note || 'No implementation has been performed. No tests have been executed.',

    // Classification counts — sourced from Bob assessment summary
    counts: {
      blocking: BOB_BLOCKERS.length,         // 5
      reviewNeeded: BOB_REVIEW_ITEMS.length, // 7
      informational: BOB_INFORMATIONAL.length, // 10
    },

    // Blockers — sourced from Bob assessment section E
    blockers: BOB_BLOCKERS,

    // Review-required — sourced from Bob assessment section F
    reviewItems: BOB_REVIEW_ITEMS,

    // Informational — sourced from Bob assessment section G
    informationalItems: BOB_INFORMATIONAL,

    // Required actions — sourced from Bob assessment section H (23 actions, 5 phases)
    requiredActions: BOB_REQUIRED_ACTIONS,

    // Test readiness — sourced from Bob assessment section I
    testReadiness: {
      summary:
        'The test suite provides zero valid coverage of the OAuth migration. ' +
        'tests/products.test.js is the only currently valid test file and it covers ' +
        'unaffected public routes. No current test result should be treated as a ' +
        'release-gate signal for the OAuth migration.',
      validTestCount: 1,        // only products.test.js
      totalTestScenarios: BOB_TEST_READINESS.length,
      domains: BOB_TEST_READINESS,
    },

    // Limitations — sourced from Bob assessment section J
    limitations: BOB_LIMITATIONS,

    // Traceability: link blockers back to risk IDs from the analysis
    riskTraceability: {
      'BLOCKER-2': 'RISK-001',
      'BLOCKER-3': 'RISK-003',
    },
  }
}

// ─── Mock-provider evaluation (simplified) ───────────────────────────────────

function buildMockEvaluation(analysis) {
  const rawReadiness = analysis.releaseReadiness || {}
  const tests = analysis.tests || []
  const risks = analysis.risks || []
  const highRisks = risks.filter((r) => String(r.severity).toUpperCase() === 'HIGH')

  return {
    status: READINESS_STATUS.REVIEW_NEEDED,
    statusLabel: rawReadiness.status || 'REVIEW NEEDED',
    classification: CLASS.REVIEW_NEEDED,

    summary: rawReadiness.summaryText || rawReadiness.summary || 'High risk change requires validation.',

    assessmentSource: 'mock',
    analysisSource: analysis.analysisSource || 'mock',
    note: 'Mock analysis: findings are illustrative and derived from scenario ground truth.',

    counts: {
      blocking: rawReadiness.blockers?.length || 0,
      reviewNeeded: highRisks.length,
      informational: 0,
    },

    blockers: (rawReadiness.blockers || []).map((b, i) => ({
      id: `BLOCKER-${i + 1}`,
      title: b,
      evidence: b,
      resolution: (rawReadiness.recommendedActions || [])[i] || 'Review required.',
    })),

    reviewItems: highRisks.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      riskRef: r.id,
    })),

    informationalItems: [],

    requiredActions: rawReadiness.recommendedActions?.length
      ? [
          {
            phase: 1,
            phaseTitle: 'Required Actions',
            phaseNote: null,
            actions: (rawReadiness.recommendedActions || []).map((a, i) => ({
              id: `A${i + 1}`,
              action: a,
              resolves: '',
            })),
          },
        ]
      : [],

    testReadiness: {
      summary: `0 / ${tests.length} tests verified. Recommended tests are proposals, not executed results.`,
      validTestCount: 0,
      totalTestScenarios: tests.length,
      domains: [],
    },

    limitations: [
      { id: 'L1', text: 'Mock analysis: findings are illustrative. Run IBM Bob analysis for production-grade assessment.' },
    ],

    riskTraceability: {},
  }
}
