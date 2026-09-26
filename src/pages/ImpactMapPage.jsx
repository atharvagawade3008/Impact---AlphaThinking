import { ArrowRight } from 'lucide-react'
import { AnalysisResultHeader, EmptyState, ImpactNode, SectionHeading } from '../components'

export default function ImpactMapPage({ analysis, onNavigate }) {
  if (!analysis) {
    return (
      <div className="page-content">
        <EmptyState
          title="No active analysis"
          detail="Submit a proposed change to explore its dependency surface and impact map."
          action={
            <button className="button primary" onClick={() => onNavigate('analyze')}>
              Start new analysis
            </button>
          }
        />
      </div>
    )
  }

  const nodes = analysis.impactMap?.nodes || [
    { label: 'Proposed Change', value: analysis.scenarioTitle || 'OAuth 2.0 Migration', tone: 'cyan' },
    { label: 'Direct Service', value: 'Authentication (authService.js)', tone: 'blue' },
    { label: 'Auth Middleware', value: 'authMiddleware.js', tone: 'amber' },
    { label: 'Protected API Routes', value: 'User / Order / Payment Routes', tone: 'amber' },
    { label: 'Recommended Tests', value: `${analysis.tests?.length || 6} Tests`, tone: 'green', last: true },
  ]

  const layers = analysis.dependencyPropagation || [
    {
      level: 'Level 1',
      badgeTone: 'cyan',
      title: 'Directly Affected Files',
      description: 'src/services/authService.js, src/middleware/authMiddleware.js, src/controllers/authController.js, src/routes/authRoutes.js, src/utils/jwt.js, .env.example',
    },
    {
      level: 'Level 2',
      badgeTone: 'blue',
      title: 'Affected Modules & Middleware',
      description: 'Authentication, Middleware, Users, Orders, Payments',
    },
    {
      level: 'Level 3',
      badgeTone: 'amber',
      title: 'Affected API Endpoints',
      description: 'POST /api/auth/login, POST /api/auth/register, GET /api/users/me, POST /api/orders, POST /api/payments',
    },
    {
      level: 'Level 4',
      badgeTone: 'green',
      title: 'Affected Test Harness & Suites',
      description: 'tests/auth.test.js, tests/integration.test.js, tests/orders.test.js, tests/payments.test.js, tests/helpers.js',
    },
  ]

  const directCount = analysis.files?.filter((f) => f[1] === 'Directly Affected').length || 6
  const indirectCount = analysis.files?.filter((f) => f[1] === 'Indirectly Affected').length || 8

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="impact"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      <section className="panel impact-map-panel">
        <SectionHeading
          eyebrow="Dependency surface"
          title="Architectural Impact Map"
          action={<span className="muted-label">{nodes.length} relationship layers mapped</span>}
        />
        <div className="impact-map">
          {nodes.map((node, index) => (
            <ImpactNode
              key={node.label}
              label={node.label}
              value={node.value}
              tone={node.tone}
              last={index === nodes.length - 1 || node.last}
            />
          ))}
        </div>
      </section>

      <div className="results-grid">
        <section className="panel">
          <SectionHeading eyebrow="Relationship breakdown" title="Dependency Propagation" />
          <div className="dependency-layers">
            {layers.map((layer) => (
              <div className="layer-item" key={layer.level}>
                <span className={`layer-badge ${layer.badgeTone || 'cyan'}`}>{layer.level}</span>
                <div>
                  <strong>{layer.title}</strong>
                  <p><code>{layer.description}</code></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeading eyebrow="Surface summary" title="Impact Metrics" />
          <div className="impact-metrics-list">
            <div className="impact-metric-row">
              <span className="metric-label">Target Repository</span>
              <span className="metric-val">{analysis.repository} ({analysis.branch})</span>
            </div>
            <div className="impact-metric-row">
              <span className="metric-label">Directly Affected Files</span>
              <span className="metric-val text-red">{directCount} files</span>
            </div>
            <div className="impact-metric-row">
              <span className="metric-label">Indirectly Affected Files</span>
              <span className="metric-val">{indirectCount} files</span>
            </div>
            <div className="impact-metric-row">
              <span className="metric-label">Files Currently Changed</span>
              <span className="metric-val text-cyan">0 (Uncommitted proposed change)</span>
            </div>
            <div className="impact-metric-row">
              <span className="metric-label">Test Verification Status</span>
              <span className="metric-val text-amber">{analysis.verificationStatus}</span>
            </div>
          </div>
          <button
            className="button secondary full-button"
            style={{ marginTop: '1.25rem' }}
            onClick={() => onNavigate('risk')}
          >
            View Risk Analysis <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  )
}
