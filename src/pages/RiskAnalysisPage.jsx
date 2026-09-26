import { useState } from 'react'
import { ArrowRight, Bot, CheckCircle2, ShieldAlert, AlertTriangle, Info, SlidersHorizontal } from 'lucide-react'
import { AnalysisResultHeader, EmptyState, SectionHeading, StatusBadge } from '../components'

export default function RiskAnalysisPage({ analysis, onNavigate }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL') // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'

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
  const highCount = risks.filter((r) => r.severity === 'HIGH' || r.severity === 'High').length
  const mediumCount = risks.filter((r) => r.severity === 'MEDIUM' || r.severity === 'Medium').length
  const lowCount = risks.filter((r) => r.severity === 'LOW' || r.severity === 'Low').length

  const filteredRisks = risks.filter((r) => {
    if (filterSeverity === 'ALL') return true
    const sev = String(r.severity).toUpperCase()
    return sev === filterSeverity
  })

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="risk"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      {/* IBM Bob Source Transparency Banner */}
      <section
        className="panel"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <Bot size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Analysis Source: {analysis.analysisSource || 'IBM Bob'}</strong>
                <span className="layer-badge cyan" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                  {risks.length} Unresolved Risk Findings
                </span>
              </div>
              <small style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                Static code inspection findings for proposed change. All risks remain active/unmitigated until code implementation.
              </small>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge tone="red">{highCount} HIGH Severity</StatusBadge>
            <StatusBadge tone="amber">{mediumCount} MEDIUM Severity</StatusBadge>
            {lowCount > 0 && <StatusBadge tone="neutral">{lowCount} LOW Severity</StatusBadge>}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="filter-tabs" style={{ background: 'var(--bg-card, #111827)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #1f2937)' }}>
          <button className={filterSeverity === 'ALL' ? 'active' : ''} onClick={() => setFilterSeverity('ALL')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            All Risk Findings ({risks.length})
          </button>
          <button className={filterSeverity === 'HIGH' ? 'active' : ''} onClick={() => setFilterSeverity('HIGH')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            HIGH Severity ({highCount})
          </button>
          <button className={filterSeverity === 'MEDIUM' ? 'active' : ''} onClick={() => setFilterSeverity('MEDIUM')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            MEDIUM Severity ({mediumCount})
          </button>
          <button className={filterSeverity === 'LOW' ? 'active' : ''} onClick={() => setFilterSeverity('LOW')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            LOW Severity ({lowCount})
          </button>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {filteredRisks.length} of {risks.length} risk items
        </span>
      </div>

      <section className="panel">
        <SectionHeading
          eyebrow="Architectural & Security Surface"
          title="Risk Analysis Breakdown"
          action={
            <span className="notice-pill">
              <AlertTriangle size={14} className="text-red" /> Unmitigated Proposed Change Findings
            </span>
          }
        />

        {filteredRisks.length === 0 ? (
          <EmptyState title="No matching risks" detail="No risk findings match the selected severity filter." />
        ) : (
          <div className="risk-details-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {filteredRisks.map((risk) => {
              const rawSev = String(risk.severity || risk.status).toUpperCase()
              const isHigh = rawSev === 'HIGH'
              const isMedium = rawSev === 'MEDIUM'
              const badgeTone = isHigh ? 'red' : isMedium ? 'amber' : 'neutral'

              return (
                <div
                  className="risk-detail-card panel-sub"
                  key={risk.id || risk.title}
                  style={{
                    padding: '1.25rem',
                    borderLeft: `4px solid ${isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#38bdf8'}`,
                    background: 'rgba(17, 24, 39, 0.7)',
                  }}
                >
                  <div className="risk-detail-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#38bdf8',
                          fontFamily: 'monospace',
                        }}
                      >
                        {risk.id || 'RISK'}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>{risk.title}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge tone={badgeTone}>{rawSev} SEVERITY</StatusBadge>
                      <StatusBadge tone="neutral" dot={false}>Unresolved</StatusBadge>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Technical Area: <strong style={{ color: '#e2e8f0' }}>{risk.area || risk.affectedArea}</strong>
                  </div>

                  {/* Why Flagged (Technical Detail from IBM Bob Analysis) */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      <Info size={14} style={{ color: '#38bdf8' }} /> Why Flagged (Technical Root Cause):
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                      {risk.description}
                    </p>
                  </div>

                  {/* Recommended Mitigation */}
                  <div className="mitigation-box" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircle2 size={16} className="mitigation-icon" style={{ color: '#10b981', flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#10b981', fontSize: '0.8rem' }}>Recommended Mitigation:</strong>
                      <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>{risk.mitigation}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button primary" onClick={() => onNavigate('tests')}>
            Proceed to Recommended Tests ({analysis.tests?.length || 13} Suites) <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  )
}
