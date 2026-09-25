import { AlertTriangle, CheckCircle, ChevronRight, CircleAlert, ShieldAlert } from 'lucide-react'
import { AnalysisResultHeader, EmptyState, SectionHeading } from '../components'

export default function ReleaseReadinessPage({ analysis, onNavigate }) {
  if (!analysis) {
    return (
      <div className="page-content">
        <EmptyState
          title="No active analysis"
          detail="Submit a proposed change to assess release readiness and blockers."
          action={
            <button className="button primary" onClick={() => onNavigate('analyze')}>
              Start new analysis
            </button>
          }
        />
      </div>
    )
  }

  const readiness = analysis.releaseReadiness || {
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
  }

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="readiness"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      <div className="readiness-hero panel">
        <div className="readiness-hero-left">
          <div className="readiness-badge-orb amber">
            <CircleAlert size={28} />
          </div>
          <div>
            <span className="eyebrow">Release Decision Status</span>
            <h2>{readiness.status}</h2>
            <p>{readiness.summaryText}</p>
          </div>
        </div>
        <div className="readiness-hero-right">
          <div className="readiness-stat">
            <span>Execution Status</span>
            <strong>{readiness.executionStatus}</strong>
          </div>
          <div className="readiness-stat">
            <span>Test Verification</span>
            <strong>{readiness.verifiedCount} / {readiness.totalTestsCount} Verified</strong>
          </div>
        </div>
      </div>

      <div className="results-grid">
        <section className="panel">
          <SectionHeading eyebrow="Critical path" title="Blocking Issues & Risk Signals" />
          <div className="readiness-blockers">
            {readiness.blockers.map((blocker, i) => (
              <div className="blocker-item" key={i}>
                <AlertTriangle size={18} className="text-red" />
                <span>{blocker}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeading eyebrow="Next steps" title="Recommended Release Actions" />
          <div className="action-checklist">
            {readiness.recommendedActions.map((action, i) => (
              <div className="action-item" key={i}>
                <CheckCircle size={18} className="text-green" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="quick-action" style={{ marginTop: '1.5rem' }}>
        <div className="quick-icon">
          <ShieldAlert size={21} />
        </div>
        <div>
          <span className="eyebrow">Ready for verification?</span>
          <h2>Connect IBM Bob Test Automation</h2>
          <p>Execute recommended test suites automatically when IBM Bob service is connected.</p>
        </div>
        <button className="button primary" onClick={() => onNavigate('tests')}>
          View Recommended Tests <ChevronRight size={15} />
        </button>
      </section>
    </div>
  )
}
