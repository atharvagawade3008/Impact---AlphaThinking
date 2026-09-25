export const repositories = [
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
  { id: 1, change: 'Replace authentication with OAuth', repo: 'platform / identity-service', files: 24, risk: 'High', status: 'Review needed', date: 'Today, 10:42 AM' },
  { id: 2, change: 'Update payment calculation', repo: 'acme-commerce / checkout', files: 8, risk: 'Medium', status: 'Ready to ship', date: 'Yesterday' },
  { id: 3, change: 'Refactor order service', repo: 'acme-commerce / checkout', files: 17, risk: 'Low', status: 'Ready to ship', date: 'Sep 22, 2026' },
  { id: 4, change: 'Upgrade database client', repo: 'platform / identity-service', files: 42, risk: 'High', status: 'Review needed', date: 'Sep 21, 2026' },
]

export const activity = [
  { title: 'Analysis completed', detail: 'Update payment calculation', time: '14 min ago', icon: 'check' },
  { title: 'Review requested', detail: 'Replace authentication with OAuth', time: '2 hr ago', icon: 'alert' },
  { title: 'Analysis started', detail: 'Upgrade database client', time: 'Yesterday', icon: 'scan' },
  { title: 'Analysis completed', detail: 'Refactor order service', time: 'Sep 22', icon: 'check' },
]

export const mockAnalysis = {
  id: 'impact-2026-0925-1042',
  change: 'Replace the existing authentication system with OAuth 2.0.',
  repository: 'platform / identity-service',
  branch: 'develop',
  timestamp: 'Sep 25, 2026 at 10:42 AM',
  overallRisk: 'High',
  summary: [
    ['Files affected', '24', 'across 5 directories'],
    ['Modules affected', '6', 'including API gateway'],
    ['Dependencies affected', '4', '2 direct, 2 transitive'],
    ['Tests recommended', '18', 'across 4 suites'],
  ],
  risks: [
    { title: 'Architecture risk', status: 'High', score: 82, tone: 'red', description: 'Token validation moves to a new provider boundary. Session handling and service-to-service auth need coordinated rollout.' },
    { title: 'Dependency risk', status: 'Medium', score: 58, tone: 'amber', description: 'The OAuth SDK introduces two transitive dependencies and a new key rotation path.' },
    { title: 'Security risk', status: 'High', score: 76, tone: 'red', description: 'Redirect URIs, token scopes, and fallback credentials require explicit review before release.' },
    { title: 'Testing risk', status: 'Medium', score: 48, tone: 'amber', description: 'Existing auth fixtures do not cover refresh token expiry or provider downtime.' },
  ],
  files: [
    ['src/auth/AuthProvider.js', 'Modified', 'High', 'Replaces local session validation with OAuth token exchange.'],
    ['src/middleware/requireUser.js', 'Modified', 'High', 'Request context now depends on remote claims.'],
    ['src/config/security.js', 'Modified', 'Medium', 'Adds issuer, audience, and key rotation configuration.'],
    ['src/routes/callback.js', 'Added', 'High', 'New callback route handles provider redirect and state.'],
    ['tests/auth/session.test.js', 'Modified', 'Medium', 'Fixtures need provider-aware tokens and expiry cases.'],
  ],
  tests: [
    { name: 'OAuth callback and state validation', reason: 'Verify redirect integrity and replay protection.', priority: 'P0', status: 'Required' },
    { name: 'Refresh token expiry flow', reason: 'Confirm users recover from expired sessions.', priority: 'P0', status: 'Required' },
    { name: 'Service-to-service scope checks', reason: 'Prevent a user token crossing service boundaries.', priority: 'P1', status: 'Recommended' },
    { name: 'Provider outage fallback', reason: 'Validate graceful failure when identity provider is unavailable.', priority: 'P1', status: 'Recommended' },
  ],
}
