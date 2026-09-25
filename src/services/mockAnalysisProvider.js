import { mockAnalysis } from '../data/mockData'

/**
 * Mock Implementation of the Analysis Provider.
 * Generates canonical analysis result payload for prototype / demo mode.
 *
 * @param {Object} input - Validated input parameters
 * @returns {Promise<Object>} Canonical Analysis Result structure
 */
export async function generateMockAnalysis(input) {
  // Simulate network & AI processing delay (~1.8s)
  await new Promise((resolve) => setTimeout(resolve, 1800))

  const analyzedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const repository = input.repository
  const branch = input.branch
  const changeDescription = input.changeDescription || input.change || mockAnalysis.change
  const pullRequest = input.pullRequest || input.pr || undefined
  const commit = input.commit || undefined
  const context = input.context || undefined

  const canonicalResult = {
    id: 'impact-2026-oauth-01',
    repository,
    branch,
    changeDescription,
    changeSummary: changeDescription,

    // Backward compatibility aliases for existing UI
    change: changeDescription,
    timestamp: analyzedAt,
    overallRisk: 'High',
    readinessStatus: 'REVIEW NEEDED',
    verificationStatus: '0/8 verified (Not yet executed)',

    impact: {
      level: 'High',
      summary: [
        ['Files affected', '24', 'across 6 directories'],
        ['Modules affected', '7', 'including Auth & Gateway'],
        ['Dependencies affected', '5', '3 direct, 2 transitive'],
        ['Tests recommended', '8', 'across 4 suites'],
      ],
      affectedFiles: [
        ['src/auth/OAuthProvider.ts', 'Added', 'High', 'Handles authorization code exchange and token parsing.'],
        ['src/middleware/authCheck.ts', 'Modified', 'High', 'Decodes bearer tokens and injects user context.'],
        ['src/session/tokenManager.ts', 'Modified', 'High', 'Manages access & refresh token storage and expiry.'],
        ['src/config/oauth.config.json', 'Added', 'Medium', 'Identity provider endpoints, client ID, and scopes.'],
        ['src/components/LoginForm.tsx', 'Modified', 'Medium', 'Replaces password inputs with SSO / OAuth login trigger.'],
        ['src/routes/oauthCallback.ts', 'Added', 'High', 'Handles code exchange redirect and error query params.'],
        ['tests/auth/oauthFlow.test.ts', 'Added', 'Medium', 'End-to-end integration tests for OAuth lifecycle.'],
      ],
      affectedModules: 7,
      dependencies: 5,
      nodes: [
        { label: 'Proposed Change', value: 'OAuth 2.0 Migration', tone: 'cyan' },
        { label: 'Direct Service', value: 'Auth Service (OAuthProvider)', tone: 'blue' },
        { label: 'Downstream Core', value: 'Session Manager · Gateway', tone: 'amber' },
        { label: 'User Surface', value: 'Login UI · Auth Checks', tone: 'amber' },
        { label: 'Recommended Tests', value: '8 Tests (5 P0 / 3 P1)', tone: 'green', last: true },
      ],
    },

    // Summary & File aliases for UI components
    summary: [
      ['Files affected', '24', 'across 6 directories'],
      ['Modules affected', '7', 'including Auth & Gateway'],
      ['Dependencies affected', '5', '3 direct, 2 transitive'],
      ['Tests recommended', '8', 'across 4 suites'],
    ],
    files: [
      ['src/auth/OAuthProvider.ts', 'Added', 'High', 'Handles authorization code exchange and token parsing.'],
      ['src/middleware/authCheck.ts', 'Modified', 'High', 'Decodes bearer tokens and injects user context.'],
      ['src/session/tokenManager.ts', 'Modified', 'High', 'Manages access & refresh token storage and expiry.'],
      ['src/config/oauth.config.json', 'Added', 'Medium', 'Identity provider endpoints, client ID, and scopes.'],
      ['src/components/LoginForm.tsx', 'Modified', 'Medium', 'Replaces password inputs with SSO / OAuth login trigger.'],
      ['src/routes/oauthCallback.ts', 'Added', 'High', 'Handles code exchange redirect and error query params.'],
      ['tests/auth/oauthFlow.test.ts', 'Added', 'Medium', 'End-to-end integration tests for OAuth lifecycle.'],
    ],
    impactMap: {
      nodes: [
        { label: 'Proposed Change', value: 'OAuth 2.0 Migration', tone: 'cyan' },
        { label: 'Direct Service', value: 'Auth Service (OAuthProvider)', tone: 'blue' },
        { label: 'Downstream Core', value: 'Session Manager · Gateway', tone: 'amber' },
        { label: 'User Surface', value: 'Login UI · Auth Checks', tone: 'amber' },
        { label: 'Recommended Tests', value: '8 Tests (5 P0 / 3 P1)', tone: 'green', last: true },
      ],
    },

    risks: [
      {
        id: 'risk-1',
        title: 'Authentication flow changes',
        severity: 'High',
        status: 'High',
        score: 88,
        tone: 'red',
        area: 'Auth Provider & Login UI',
        affectedArea: 'Auth Provider & Login UI',
        description: 'Token exchange protocol replaces local password hash validation. Requires updated callback handling and redirect allowlist validation.',
        mitigation: 'Audit state parameter verification and enforce exact redirect URI allowlisting across environments.',
      },
      {
        id: 'risk-2',
        title: 'Session/token handling',
        severity: 'High',
        status: 'High',
        score: 82,
        tone: 'red',
        area: 'Session Manager & JWT Store',
        affectedArea: 'Session Manager & JWT Store',
        description: 'Tokens expire faster than legacy session cookies and require automated refresh token rotation handling.',
        mitigation: 'Implement fallback session refresh handler and automated token expiration tests in tokenManager.',
      },
      {
        id: 'risk-3',
        title: 'API authorization middleware',
        severity: 'Medium',
        status: 'Medium',
        score: 65,
        tone: 'amber',
        area: 'Gateway Middleware (authCheck.ts)',
        affectedArea: 'Gateway Middleware (authCheck.ts)',
        description: 'Request context now relies on decoded OAuth bearer tokens rather than internal session headers.',
        mitigation: 'Update scope enforcement tests across identity-service and gateway boundaries.',
      },
      {
        id: 'risk-4',
        title: 'Login UI integration',
        severity: 'Medium',
        status: 'Medium',
        score: 54,
        tone: 'amber',
        area: 'Frontend Login Form & SSO Buttons',
        affectedArea: 'Frontend Login Form & SSO Buttons',
        description: 'Redirect sequence replaces inline form submission, changing failure handling and state preservation.',
        mitigation: 'Test OAuth callback error query parameters and user cancellation flows thoroughly.',
      },
      {
        id: 'risk-5',
        title: 'Existing authentication tests',
        severity: 'Medium',
        status: 'Medium',
        score: 48,
        tone: 'amber',
        area: 'Integration Test Suite',
        affectedArea: 'Integration Test Suite',
        description: 'Legacy mock user credentials in existing integration tests will fail with OAuth endpoint validation.',
        mitigation: 'Update test fixtures with mock OAuth provider server for unit and integration testing.',
      },
    ],

    tests: [
      {
        id: 'test-1',
        name: 'OAuth login success',
        type: 'Integration Test',
        priority: 'P0',
        component: 'OAuthProvider',
        affectedArea: 'OAuthProvider',
        status: 'Not verified',
        reason: 'Verify authorization code exchange returns valid access token and user identity.',
      },
      {
        id: 'test-2',
        name: 'OAuth callback failure',
        type: 'Integration Test',
        priority: 'P0',
        component: 'oauthCallback',
        affectedArea: 'oauthCallback',
        status: 'Not verified',
        reason: 'Ensure invalid state or error query parameter gracefully returns user to login with error feedback.',
      },
      {
        id: 'test-3',
        name: 'Expired/invalid token handling',
        type: 'Unit Test',
        priority: 'P0',
        component: 'tokenManager',
        affectedArea: 'tokenManager',
        status: 'Not verified',
        reason: 'Confirm expired access tokens trigger refresh flow or prompt re-authentication.',
      },
      {
        id: 'test-4',
        name: 'Session persistence',
        type: 'Unit Test',
        priority: 'P1',
        component: 'tokenManager',
        affectedArea: 'tokenManager',
        status: 'Not verified',
        reason: 'Validate session state preservation across browser reloads and tab navigation.',
      },
      {
        id: 'test-5',
        name: 'Unauthorized API access',
        type: 'Security Test',
        priority: 'P0',
        component: 'authCheck Middleware',
        affectedArea: 'authCheck Middleware',
        status: 'Not verified',
        reason: 'Verify requests without valid bearer tokens return HTTP 401 Unauthorized.',
      },
      {
        id: 'test-6',
        name: 'Existing user migration',
        type: 'Data Test',
        priority: 'P1',
        component: 'OAuthProvider',
        affectedArea: 'OAuthProvider',
        status: 'Not verified',
        reason: 'Ensure existing database user IDs map seamlessly to OAuth provider subject claims.',
      },
      {
        id: 'test-7',
        name: 'Logout flow',
        type: 'E2E Test',
        priority: 'P1',
        component: 'LoginForm & OAuthProvider',
        affectedArea: 'LoginForm & OAuthProvider',
        status: 'Not verified',
        reason: 'Confirm local session tokens are revoked and identity provider session is terminated.',
      },
      {
        id: 'test-8',
        name: 'Regression tests for protected routes',
        type: 'E2E Test',
        priority: 'P0',
        component: 'API Gateway',
        affectedArea: 'API Gateway',
        status: 'Not verified',
        reason: 'Ensure all protected endpoints enforce required scope validation.',
      },
    ],

    releaseReadiness: {
      status: 'REVIEW NEEDED',
      summary: 'High architecture and security risk requires validation of the new OAuth identity boundary.',
      summaryText: 'High architecture and security risk requires validation of the new OAuth identity boundary.',
      executionStatus: 'Not yet verified',
      verifiedCount: 0,
      totalTestsCount: 8,
      blockers: [
        'OAuth callback state parameter validation tests are not yet executed.',
        'Security review of redirect URI allowlists and token scope delegation is pending.',
      ],
      recommendedActions: [
        'Execute P0 test suite (5 critical tests).',
        'Configure production identity provider client secrets and callback URLs.',
        'Obtain platform security team sign-off prior to production deployment.',
      ],
    },

    metadata: {
      analyzedAt,
      analysisSource: 'mock',
      duration: '1.8s',
      pullRequest,
      commit,
      context,
    },
  }

  return canonicalResult
}
