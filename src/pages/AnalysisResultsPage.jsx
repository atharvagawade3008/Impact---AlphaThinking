import { Check, ChevronRight, CircleAlert } from 'lucide-react'
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
        activeTab="results"
        onNavigate={onNavigate}
        onBack={onBack}
      />

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
                View all risks <ChevronRight size={14} />
              </button>
            }
          />
          {analysis.risks.map((risk) => (
            <div className="risk-row" key={risk.title}>
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
              <strong>{analysis.readinessStatus || 'Review needed'}</strong>
              <span>Not ready to ship · {analysis.verificationStatus || '0/8 verified'}</span>
            </div>
          </div>
          <div className="readiness-block">
            <span>Why</span>
            <p>High architecture and security risk requires validation of the new OAuth identity boundary.</p>
          </div>
          <div className="readiness-block">
            <span>Blocking issues</span>
            <p>OAuth callback state parameter validation tests are not yet executed.</p>
          </div>
          <div className="readiness-block">
            <span>Recommended actions</span>
            <p>Run P0 tests, verify redirect allowlists, and get platform security sign-off.</p>
          </div>
          <button className="button secondary full-button" onClick={() => onNavigate('tests')}>
            View recommended tests ({analysis.tests?.length || 8}) <ChevronRight size={15} />
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
                All tests ({analysis.tests?.length || 8}) <ChevronRight size={14} />
              </button>
            }
          />
          <div className="test-list">
            {analysis.tests.map((test) => (
              <div className="test-item" key={test.name}>
                <span className="test-check">
                  <Check size={13} />
                </span>
                <div>
                  <strong>{test.name}</strong>
                  <p>{test.reason}</p>
                </div>
                <StatusBadge tone={test.priority === 'P0' ? 'red' : 'amber'}>
                  {test.priority}
                </StatusBadge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
