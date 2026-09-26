import { Check, ChevronRight, CircleAlert, Bot } from 'lucide-react'
import {
  AnalysisResultHeader,
  EmptyState,
  ImpactNode,
  RiskBadge,
  SectionHeading,
  StatusBadge,
} from '../components'

export default function AnalysisResultsPage({ analysis, onBack, onNavigate }) {
  if (!analysis) {
    return (
      <div className="page-content">
        <EmptyState
          title="No active analysis"
          detail="Submit a proposed change to view change impact, risk evaluation, and recommended tests."
          action={
            <button className="button primary" onClick={() => onNavigate('analyze')}>
              Start new analysis
            </button>
          }
        />
      </div>
    )
  }

  const nodes = analysis.impact?.nodes || [
    { label: 'Proposed Change', value: analysis.scenarioTitle || 'OAuth 2.0 Migration', tone: 'cyan' },
    { label: 'Direct Service', value: 'Authentication (authService.js)', tone: 'blue' },
    { label: 'Auth Middleware', value: 'authMiddleware.js', tone: 'amber' },
    { label: 'Protected API Routes', value: 'User / Order / Payment Routes', tone: 'amber' },
    { label: 'Recommended Tests', value: `${analysis.tests?.length || 13} Tests`, tone: 'green', last: true },
  ]

  const readiness = analysis.releaseReadiness || {}

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="results"
        onNavigate={onNavigate}
        onBack={onBack}
      />

      {/* Analysis Source Metadata Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          marginBottom: '1rem',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={16} style={{ color: '#38bdf8' }} />
          <span>
            Powered by <strong>{analysis.analysisSource || 'IBM Bob'}</strong> static code analysis
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          {analysis.generatedBy || 'Static source-code analysis'}
        </span>
      </div>

      <section className="summary-strip">
        {analysis.summary.map(([label, value, detail]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </section>

      <section className="panel impact-map-panel">
        <SectionHeading
          eyebrow="Dependency surface"
          title="Impact map"
          action={
            <button className="text-button" onClick={() => onNavigate('impact')}>
              View full map <ChevronRight size={14} />
            </button>
          }
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
          <SectionHeading
            eyebrow="Signal review"
            title="Risk analysis"
            action={
              <button className="text-button" onClick={() => onNavigate('risk')}>
                View all risks ({analysis.risks?.length || 7}) <ChevronRight size={14} />
              </button>
            }
          />
          {analysis.risks.slice(0, 4).map((risk) => (
            <div className="risk-row" key={risk.id || risk.title}>
              <div className={`risk-score ${risk.tone}`}>
                <strong>{risk.score}</strong>
                <span>/100</span>
              </div>
              <div className="risk-copy">
                <div>
                  <strong>{risk.title}</strong>
                  <StatusBadge tone={risk.tone}>{risk.severity || risk.status}</StatusBadge>
                </div>
                <p>{risk.description}</p>
                <div className="risk-bar">
                  <span className={risk.tone} style={{ width: `${risk.score}%` }} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="panel readiness-panel">
          <SectionHeading
            eyebrow="Go / no-go"
            title="Release readiness"
            action={
              <button className="text-button" onClick={() => onNavigate('readiness')}>
                Details <ChevronRight size={14} />
              </button>
            }
          />
          <div className="readiness-status">
            <CircleAlert size={20} />
            <div>
              <strong>{readiness.status || analysis.readinessStatus || 'REVIEW NEEDED'}</strong>
              <span>Not ready to ship · {readiness.executionStatus || analysis.verificationStatus || '0/13 verified'}</span>
            </div>
          </div>
          <div className="readiness-block">
            <span>Why</span>
            <p>{readiness.summaryText || readiness.summary || 'Core authentication mechanism replacement requires technical review and test validation.'}</p>
          </div>
          <div className="readiness-block">
            <span>Blocking issues</span>
            <p>{readiness.blockers?.[0] || 'Proposed changes have not been executed against regression test suites.'}</p>
          </div>
          <div className="readiness-block">
            <span>Recommended actions</span>
            <p>{readiness.recommendedActions?.join(' ') || 'Execute recommended test suites and verify API contract compatibility.'}</p>
          </div>
          <button className="button secondary full-button" onClick={() => onNavigate('tests')}>
            View recommended tests ({analysis.tests?.length || 13}) <ChevronRight size={15} />
          </button>
        </section>
      </div>

      <div className="results-grid lower-grid">
        <section className="panel">
          <SectionHeading eyebrow="Repository surface" title="Affected files" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Impact</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {analysis.files.map(([file, type, impact, reason]) => (
                  <tr key={file}>
                    <td>
                      <code className="file-code">{file}</code>
                    </td>
                    <td className="muted-cell">{type}</td>
                    <td>
                      <RiskBadge risk={impact} />
                    </td>
                    <td className="muted-cell">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <SectionHeading
            eyebrow="Coverage plan"
            title="Recommended tests"
            action={
              <button className="text-button" onClick={() => onNavigate('tests')}>
                All tests ({analysis.tests?.length || 13}) <ChevronRight size={14} />
              </button>
            }
          />
          <div className="test-list">
            {analysis.tests.slice(0, 6).map((test) => (
              <div className="test-item" key={test.id || test.name}>
                <span className="test-check">
                  <Check size={13} />
                </span>
                <div>
                  <strong>{test.name}</strong>
                  <p>{test.reason}</p>
                </div>
                <StatusBadge tone={test.priority === 'HIGH' || test.displayPriority === 'P0' ? 'red' : 'amber'}>
                  {test.displayPriority || (test.priority === 'HIGH' ? 'P0' : 'P1')}
                </StatusBadge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
