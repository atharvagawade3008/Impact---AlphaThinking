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
    { label: 'Proposed Change', value: 'OAuth 2.0 Migration', tone: 'cyan' },
    { label: 'Direct Service', value: 'Auth Service (OAuthProvider)', tone: 'blue' },
    { label: 'Downstream Core', value: 'Session Manager · Gateway', tone: 'amber' },
    { label: 'User Surface', value: 'Login UI · Auth Checks', tone: 'amber' },
    { label: 'Recommended Tests', value: '8 Tests (5 P0 / 3 P1)', tone: 'green', last: true },
  ]

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
          action={<span className="muted-label">5 relationship layers mapped</span>}
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
            <div className="layer-item">
              <span className="layer-badge cyan">Level 1</span>
              <div>
                <strong>Direct Service Modification</strong>
                <p><code>src/auth/OAuthProvider.ts</code> replaces legacy password hash logic with authorization code exchange.</p>
              </div>
            </div>
            <div className="layer-item">
              <span className="layer-badge blue">Level 2</span>
              <div>
                <strong>Downstream Core Services & Middleware</strong>
                <p><code>src/session/tokenManager.ts</code> and <code>src/middleware/authCheck.ts</code> consume OAuth bearer tokens.</p>
              </div>
            </div>
            <div className="layer-item">
              <span className="layer-badge amber">Level 3</span>
              <div>
                <strong>User Surface & Entry Points</strong>
                <p><code>LoginForm.tsx</code> and OAuth callback route (<code>oauthCallback.ts</code>) present the new authentication entry flow.</p>
              </div>
            </div>
            <div className="layer-item">
              <span className="layer-badge green">Level 4</span>
              <div>
                <strong>Required Test Suite Validation</strong>
                <p>8 recommended test suites cover code exchange, token expiration, unauthorized access, and logout handling.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <SectionHeading eyebrow="Surface summary" title="Impact Metrics" />
          <div className="impact-metrics-list">
            <div className="impact-metric-row">
              <span className="metric-label">Affected Directories</span>
              <span className="metric-val">6 directories</span>
            </div>
            <div className="impact-metric-row">
              <span className="metric-label">Direct Service Impact</span>
              <span className="metric-val text-red">High (Authentication)</span>
            </div>
            <div className="impact-metric-row">
              <span className="metric-label">Transitive Dependencies</span>
              <span className="metric-val">2 external libraries</span>
            </div>
            <div className="impact-metric-row">
              <span className="metric-label">Test Coverage Gap</span>
              <span className="metric-val text-amber">0/8 verified</span>
            </div>
          </div>
          <button className="button secondary full-button" style={{ marginTop: '1.25rem' }} onClick={() => onNavigate('risk')}>
            View Risk Analysis <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  )
}
