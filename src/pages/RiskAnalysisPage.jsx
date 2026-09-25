import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { AnalysisResultHeader, EmptyState, SectionHeading, StatusBadge } from '../components'

export default function RiskAnalysisPage({ analysis, onNavigate }) {
  if (!analysis) {
    return (
      <div className="page-content">
        <EmptyState
          title="No active analysis"
          detail="Submit a proposed change to evaluate risks and security considerations."
          action={
            <button className="button primary" onClick={() => onNavigate('analyze')}>
              Start new analysis
            </button>
          }
        />
      </div>
    )
  }

  const risks = analysis.risks || []

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="risk"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      <section className="panel">
        <SectionHeading
          eyebrow="Signal review & Security Surface"
          title="Risk Analysis Breakdown"
          action={<StatusBadge tone="red">{analysis.overallRisk || 'High'} overall risk</StatusBadge>}
        />
        <div className="risk-details-list">
          {risks.map((risk) => (
            <div className="risk-detail-card panel-sub" key={risk.title}>
              <div className="risk-detail-header">
                <div className={`risk-score ${risk.tone}`}>
                  <strong>{risk.score}</strong>
                  <span>/100</span>
                </div>
                <div className="risk-title-wrap">
                  <div className="risk-title-row">
                    <h3>{risk.title}</h3>
                    <StatusBadge tone={risk.tone}>{risk.severity || risk.status}</StatusBadge>
                  </div>
                  <span className="affected-area-tag">
                    Affected Area: <strong>{risk.affectedArea}</strong>
                  </span>
                </div>
              </div>
              <p className="risk-description">{risk.description}</p>
              <div className="mitigation-box">
                <CheckCircle2 size={16} className="mitigation-icon" />
                <div>
                  <strong>Recommended Mitigation</strong>
                  <p>{risk.mitigation}</p>
                </div>
              </div>
              <div className="risk-bar" style={{ marginTop: '0.75rem' }}>
                <span className={risk.tone} style={{ width: `${risk.score}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button primary" onClick={() => onNavigate('tests')}>
            Proceed to Recommended Tests <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  )
}
