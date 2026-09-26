import { ArrowRight, Info } from 'lucide-react'
import { AnalysisResultHeader, EmptyState, SectionHeading, StatusBadge } from '../components'

export default function TestRecommendationsPage({ analysis, onNavigate }) {
  if (!analysis) {
    return (
      <div className="page-content">
        <EmptyState
          title="No active analysis"
          detail="Submit a proposed change to view targeted test suite recommendations."
          action={
            <button className="button primary" onClick={() => onNavigate('analyze')}>
              Start new analysis
            </button>
          }
        />
      </div>
    )
  }

  const tests = analysis.tests || []
  const p0Count = tests.filter((t) => t.priority === 'P0').length
  const p1Count = tests.filter((t) => t.priority !== 'P0').length
  const primaryModule = analysis.summary?.find(([label]) => label === 'Modules affected')?.[2]?.split(', ')?.[0] || 'Authentication'

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="tests"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      <section className="summary-strip">
        <div>
          <span>Recommended Tests</span>
          <strong>{tests.length} suites</strong>
          <small>{p0Count} P0 Critical, {p1Count} P1 Recommended</small>
        </div>
        <div>
          <span>Execution Status</span>
          <strong>{analysis.verificationStatus || 'Not verified'}</strong>
          <small>0 / {tests.length} executed</small>
        </div>
        <div>
          <span>Primary Surface</span>
          <strong>{primaryModule} Module</strong>
          <small>{analysis.repository} ({analysis.branch})</small>
        </div>
        <div>
          <span>Verification Engine</span>
          <strong>Mock Mode</strong>
          <small>Ready for CI/CD connection</small>
        </div>
      </section>

      <section className="panel">
        <SectionHeading
          eyebrow="Coverage plan & Test suite"
          title="Recommended Test Coverage"
          action={
            <span className="notice-pill">
              <Info size={14} /> Execution Status: <strong>{analysis.verificationStatus || 'Not yet verified'}</strong>
            </span>
          }
        />
        <div className="test-cards-grid">
          {tests.map((test) => (
            <div className="test-card panel-sub" key={test.id || test.name}>
              <div className="test-card-top">
                <StatusBadge tone={test.priority === 'P0' ? 'red' : 'amber'}>
                  {test.priority} Priority
                </StatusBadge>
                <span className="test-type-badge">{test.type || 'Integration Test'}</span>
                <StatusBadge tone="neutral" dot={false}>
                  {test.status || 'Not verified'}
                </StatusBadge>
              </div>
              <h3 className="test-card-title">{test.name}</h3>
              <p className="test-card-reason">{test.reason}</p>
              <div className="test-card-foot">
                <span>Target: <code>{test.component}</code> {test.testFile ? `(${test.testFile})` : ''}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button primary" onClick={() => onNavigate('readiness')}>
            View Release Readiness <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  )
}
