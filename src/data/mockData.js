export const repositories = [
  { name: 'ShopFlow', branch: 'feature/oauth-migration', language: 'TypeScript / Node.js' },
  { name: 'acme-commerce / checkout', branch: 'main', language: 'Node.js' },
  { name: 'platform / identity-service', branch: 'develop', language: 'Java' },
  { name: 'mobile / customer-app', branch: 'release/4.8', language: 'Kotlin' },
]

export const summaryMetrics = [
  { label: 'Analyses run', value: '128', delta: '+18.4%', detail: 'vs. last month', tone: 'cyan' },
  { label: 'High risk changes', value: '12', delta: '-8.2%', detail: 'vs. last month', tone: 'red' },
  { label: 'Files affected', value: '846', delta: '+24.6%', detail: 'across all analyses', tone: 'amber' },
  { label: 'Tests recommended', value: '294', delta: '+12.1%', detail: 'ready to validate', tone: 'green' },
]

export const recentAnalyses = [
  { id: 1, change: 'Replace authentication with OAuth 2.0', repo: 'ShopFlow', files: 24, risk: 'High', status: 'Review needed', date: 'Today, 10:42 AM' },
  { id: 2, change: 'Update payment calculation', repo: 'acme-commerce / checkout', files: 8, risk: 'Medium', status: 'Ready to ship', date: 'Yesterday' },
  { id: 3, change: 'Refactor order service', repo: 'acme-commerce / checkout', files: 17, risk: 'Low', status: 'Ready to ship', date: 'Sep 22, 2026' },
  { id: 4, change: 'Upgrade database client', repo: 'platform / identity-service', files: 42, risk: 'High', status: 'Review needed', date: 'Sep 21, 2026' },
]

export const activity = [
  { title: 'Analysis completed', detail: 'Replace authentication with OAuth 2.0', time: '14 min ago', icon: 'scan' },
  { title: 'Review requested', detail: 'Update payment calculation', time: '2 hr ago', icon: 'alert' },
  { title: 'Analysis started', detail: 'Upgrade database client', time: 'Yesterday', icon: 'scan' },
  { title: 'Analysis completed', detail: 'Refactor order service', time: 'Sep 22', icon: 'check' },
]

export const mockAnalysis = {
  id: 'impact-2026-oauth-01',
  change: 'Replace the existing email/password authentication flow with OAuth 2.0 authentication.',
  repository: 'ShopFlow',
  branch: 'feature/oauth-migration',
  timestamp: 'Today, 10:42 AM',
  overallRisk: 'High',
  readinessStatus: 'REVIEW NEEDED',
  verificationStatus: '0/8 verified (Not yet executed)',
  summary: [
    ['Files affected', '24', 'across 6 directories'],
    ['Modules affected', '7', 'including Auth & Gateway'],
    ['Dependencies affected', '5', '3 direct, 2 transitive'],
    ['Tests recommended', '8', 'across 4 suites'],
  ],
  impactMap: {
    change: 'OAuth 2.0 Authentication Migration',
    directComponent: 'Authentication Service (OAuthProvider.ts)',
    downstreamServices: 'Session Management & API Gateway Middleware',
    affectedSurface: 'Login UI, User Context, Authorization Checks & Billing Handlers',
    testCoverage: '8 Recommended Tests (5 P0 Critical, 3 P1 Recommended)',
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
      title: 'Authentication flow changes',
      severity: 'High',
      score: 88,
      tone: 'red',
      affectedArea: 'Auth Provider & Login UI',
      description: 'Token exchange protocol replaces local password hash validation. Requires updated callback handling and redirect allowlist validation.',
      mitigation: 'Audit state parameter verification and enforce exact redirect URI allowlisting across environments.',
    },
    {
      title: 'Session/token handling',
      severity: 'High',
      score: 82,
      tone: 'red',
      affectedArea: 'Session Manager & JWT Store',
      description: 'Tokens expire faster than legacy session cookies and require automated refresh token rotation handling.',
      mitigation: 'Implement fallback session refresh handler and automated token expiration tests in tokenManager.',
    },
    {
      title: 'API authorization middleware',
      severity: 'Medium',
      score: 65,
      tone: 'amber',
      affectedArea: 'Gateway Middleware (authCheck.ts)',
      description: 'Request context now relies on decoded OAuth bearer tokens rather than internal session headers.',
      mitigation: 'Update scope enforcement tests across identity-service and gateway boundaries.',
    },
    {
      title: 'Login UI integration',
      severity: 'Medium',
      score: 54,
      tone: 'amber',
      affectedArea: 'Frontend Login Form & SSO Buttons',
      description: 'Redirect sequence replaces inline form submission, changing failure handling and state preservation.',
      mitigation: 'Test OAuth callback error query parameters and user cancellation flows thoroughly.',
    },
    {
      title: 'Existing authentication tests',
      severity: 'Medium',
      score: 48,
      tone: 'amber',
      affectedArea: 'Integration Test Suite',
      description: 'Legacy mock user credentials in existing integration tests will fail with OAuth endpoint validation.',
      mitigation: 'Update test fixtures with mock OAuth provider server for unit and integration testing.',
    },
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
  tests: [
    {
      name: 'OAuth login success',
      type: 'Integration Test',
      priority: 'P0',
      component: 'OAuthProvider',
      status: 'Not verified',
      reason: 'Verify authorization code exchange returns valid access token and user identity.',
    },
    {
      name: 'OAuth callback failure',
      type: 'Integration Test',
      priority: 'P0',
      component: 'oauthCallback',
      status: 'Not verified',
      reason: 'Ensure invalid state or error query parameter gracefully returns user to login with error feedback.',
    },
    {
      name: 'Expired/invalid token handling',
      type: 'Unit Test',
      priority: 'P0',
      component: 'tokenManager',
      status: 'Not verified',
      reason: 'Confirm expired access tokens trigger refresh flow or prompt re-authentication.',
    },
    {
      name: 'Session persistence',
      type: 'Unit Test',
      priority: 'P1',
      component: 'tokenManager',
      status: 'Not verified',
      reason: 'Validate session state preservation across browser reloads and tab navigation.',
    },
    {
      name: 'Unauthorized API access',
      type: 'Security Test',
      priority: 'P0',
      component: 'authCheck Middleware',
      status: 'Not verified',
      reason: 'Verify requests without valid bearer tokens return HTTP 401 Unauthorized.',
    },
    {
      name: 'Existing user migration',
      type: 'Data Test',
      priority: 'P1',
      component: 'OAuthProvider',
      status: 'Not verified',
      reason: 'Ensure existing database user IDs map seamlessly to OAuth provider subject claims.',
    },
    {
      name: 'Logout flow',
      type: 'E2E Test',
      priority: 'P1',
      component: 'LoginForm & OAuthProvider',
      status: 'Not verified',
      reason: 'Confirm local session tokens are revoked and identity provider session is terminated.',
    },
    {
      name: 'Regression tests for protected routes',
      type: 'E2E Test',
      priority: 'P0',
      component: 'API Gateway',
      status: 'Not verified',
      reason: 'Ensure all protected endpoints enforce required scope validation.',
    },
  ],
  releaseReadiness: {
    status: 'REVIEW NEEDED',
    executionStatus: 'Not yet verified',
    verifiedCount: 0,
    totalTestsCount: 8,
    summaryText: 'High architecture and security risk requires validation of the new OAuth identity boundary.',
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
}

export const settingsItems = [
  { title: 'Repository configuration', detail: 'Manage repositories, branches, and access scopes' },
  { title: 'Analysis preferences', detail: 'Set risk thresholds and default test coverage' },
  { title: 'Notifications', detail: 'Choose when IMPACT sends review updates' },
  { title: 'IBM Bob integration', detail: 'Configure the future analysis provider connection' },
  { title: 'Theme', detail: 'Dark theme is active for this workspace' },
]

export const pipelineStages = [
  'Analyzing repository structure...',
  'Tracing service & code dependencies...',
  'Evaluating affected components & risk surface...',
  'Identifying recommended test coverage...',
  'Generating release readiness report...',
]
