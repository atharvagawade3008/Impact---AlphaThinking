import { useState } from 'react'
import { ArrowRight, Bot, FileCheck, Info, CheckCircle2, AlertCircle, ShieldAlert, Layers } from 'lucide-react'
import { ActionFooter, AnalysisResultHeader, EmptyState, SectionHeading, StatusBadge } from '../components'


export default function TestRecommendationsPage({ analysis, onNavigate }) {
  const [filterPriority, setFilterPriority] = useState('ALL') // 'ALL' | 'HIGH' | 'MEDIUM'
  const [filterFile, setFilterFile] = useState('ALL') // 'ALL' | 'auth' | 'orders' | 'payments' | 'integration' | 'products'

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
  const highCount = tests.filter((t) => String(t.priority).toUpperCase() === 'HIGH').length
  const mediumCount = tests.filter((t) => String(t.priority).toUpperCase() === 'MEDIUM').length

  const filteredTests = tests.filter((test) => {
    if (filterPriority !== 'ALL') {
      const prio = String(test.priority).toUpperCase()
      if (prio !== filterPriority) return false
    }
    if (filterFile !== 'ALL') {
      if (!test.testFile.includes(filterFile)) return false
    }
    return true
  })

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="tests"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      {/* IBM Bob Source Transparency & Execution Status Banner */}
      <section
        className="panel"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Bot size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Analysis Source: {analysis.analysisSource || 'IBM Bob'}</strong>
                <span className="layer-badge green" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                  {tests.length} Test Recommendations
                </span>
              </div>
              <small style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                Static analysis test coverage plan for proposed OAuth migration. Recommended tests are not yet executed.
              </small>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge tone="neutral" dot={false}>
              Execution Status: 0/{tests.length} Executed
            </StatusBadge>
            <StatusBadge tone="red">{highCount} HIGH Priority</StatusBadge>
            <StatusBadge tone="amber">{mediumCount} MEDIUM Priority</StatusBadge>
          </div>
        </div>
      </section>

      {/* Summary Metrics Strip */}
      <section className="summary-strip">
        <div>
          <span>Recommended Tests</span>
          <strong>{tests.length} suites</strong>
          <small>{highCount} HIGH Priority, {mediumCount} MEDIUM Priority</small>
        </div>
        <div>
          <span>Execution Status</span>
          <strong>Not Executed</strong>
          <small>0 / {tests.length} run against shopflow-demo/</small>
        </div>
        <div>
          <span>Primary Test Harness</span>
          <strong>node --test</strong>
          <small>{analysis.repository} ({analysis.branch})</small>
        </div>
        <div>
          <span>Analysis Engine</span>
          <strong>IBM Bob</strong>
          <small>Source Code Inspection</small>
        </div>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.25rem 0 0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="filter-tabs" style={{ background: 'var(--bg-card, #111827)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #1f2937)' }}>
          <button className={filterPriority === 'ALL' && filterFile === 'ALL' ? 'active' : ''} onClick={() => { setFilterPriority('ALL'); setFilterFile('ALL') }} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            All Recommendations ({tests.length})
          </button>
          <button className={filterPriority === 'HIGH' ? 'active' : ''} onClick={() => setFilterPriority('HIGH')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            HIGH Priority ({highCount})
          </button>
          <button className={filterPriority === 'MEDIUM' ? 'active' : ''} onClick={() => setFilterPriority('MEDIUM')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            MEDIUM Priority ({mediumCount})
          </button>
          <button className={filterFile === 'auth' ? 'active' : ''} onClick={() => setFilterFile('auth')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            tests/auth.test.js
          </button>
          <button className={filterFile === 'orders' ? 'active' : ''} onClick={() => setFilterFile('orders')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            tests/orders.test.js
          </button>
          <button className={filterFile === 'payments' ? 'active' : ''} onClick={() => setFilterFile('payments')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            tests/payments.test.js
          </button>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {filteredTests.length} of {tests.length} tests
        </span>
      </div>

      <section className="panel">
        <SectionHeading
          eyebrow="Coverage Plan & Technical Test Matrix"
          title="Recommended Test Suite Validation"
          action={
            <span className="notice-pill">
              <Info size={14} /> Execution Status: <strong>0/{tests.length} Executed (Not Verified)</strong>
            </span>
          }
        />

        {filteredTests.length === 0 ? (
          <EmptyState title="No matching test recommendations" detail="No tests match the selected filter." />
        ) : (
          <div className="test-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', padding: '4px 20px 20px' }}>
            {filteredTests.map((test) => {
              const rawPriority = String(test.priority).toUpperCase()
              const isHigh = rawPriority === 'HIGH' || test.priority === 'P0'

              return (
                <div
                  className="test-card panel-sub"
                  key={test.id || test.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    padding: '1.1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #1f2937)',
                    background: 'rgba(17, 24, 39, 0.7)',
                    borderTop: `3px solid ${isHigh ? '#ef4444' : '#f59e0b'}`,
                  }}
                >
                  <div>
                    <div className="test-card-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#38bdf8',
                            fontFamily: 'monospace',
                          }}
                        >
                          {test.id}
                        </span>
                        <StatusBadge tone={isHigh ? 'red' : 'amber'}>
                          {rawPriority} PRIORITY
                        </StatusBadge>
                      </div>
                      <StatusBadge tone="neutral" dot={false}>
                        Not Executed
                      </StatusBadge>
                    </div>

                    <h3 className="test-card-title" style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', lineHeight: '1.4', marginBottom: '0.6rem' }}>
                      {test.name}
                    </h3>

                    {/* Causal Reason from IBM Bob */}
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                        Why this test is required:
                      </span>
                      <p className="test-card-reason" style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.45', margin: 0 }}>
                        {test.reason}
                      </p>
                    </div>
                  </div>

                  <div className="test-card-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>
                      Target Test Suite: <code style={{ color: '#38bdf8' }}>{test.testFile || test.component}</code>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <ActionFooter align="end">
          <button className="button primary" onClick={() => onNavigate('readiness')}>
            View Release Readiness <ArrowRight size={15} />
          </button>
        </ActionFooter>
      </section>

    </div>
  )
}
