import { useState } from 'react'
import {
  ArrowRight,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  Info,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { AnalysisResultHeader, EmptyState, SectionHeading, StatusBadge } from '../components'
import { READINESS_STATUS, CLASS } from '../services/releaseReadinessEvaluator'

// ─── Small presentational helpers ────────────────────────────────────────────

function BlockerCard({ blocker }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rr-blocker-card">
      <div className="rr-blocker-header" onClick={() => setExpanded((v) => !v)}>
        <div className="rr-blocker-left">
          <XCircle size={17} className="rr-icon-red" />
          <div>
            <span className="rr-blocker-id">{blocker.id}</span>
            <strong className="rr-blocker-title">{blocker.title}</strong>
          </div>
        </div>
        <button className="icon-button" aria-label={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
      {expanded && (
        <div className="rr-blocker-body">
          <div className="rr-detail-block">
            <span className="rr-detail-label">
              <Info size={13} style={{ color: '#38bdf8' }} /> Evidence
            </span>
            <p>{blocker.evidence}</p>
          </div>
          <div className="rr-detail-block rr-resolution">
            <span className="rr-detail-label">
              <CheckCircle size={13} style={{ color: '#10b981' }} /> Resolution required
            </span>
            <p>{blocker.resolution}</p>
          </div>
          {blocker.sourceRef && (
            <div style={{ marginTop: '0.5rem' }}>
              <code className="rr-source-ref">Source: {blocker.sourceRef}</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rr-review-card">
      <div className="rr-blocker-header" onClick={() => setExpanded((v) => !v)}>
        <div className="rr-blocker-left">
          <CircleAlert size={16} className="rr-icon-amber" />
          <div>
            <span className="rr-blocker-id">{item.id}</span>
            <strong className="rr-blocker-title">{item.title}</strong>
          </div>
        </div>
        <button className="icon-button" aria-label={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
      {expanded && (
        <div className="rr-blocker-body">
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
            {item.description}
          </p>
          {item.riskRef && (
            <div style={{ marginTop: '0.5rem' }}>
              <code className="rr-source-ref">Linked risk: {item.riskRef}</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TestDomainRow({ domain }) {
  return (
    <div className="rr-test-row">
      <div className="rr-test-status">
        {domain.valid
          ? <CheckCircle size={15} style={{ color: '#10b981' }} />
          : <XCircle size={15} style={{ color: '#ef4444' }} />
        }
      </div>
      <div className="rr-test-info">
        <strong style={{ fontSize: '0.85rem', color: '#f0f4f8' }}>{domain.domain}</strong>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{domain.reason}</p>
      </div>
      <StatusBadge tone={domain.valid ? 'green' : 'red'} dot={false}>
        {domain.valid ? 'Valid' : 'Not Valid'}
      </StatusBadge>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReleaseReadinessPage({ analysis, onNavigate }) {
  const [actionsExpanded, setActionsExpanded] = useState(false)
  const [infExpanded, setInfExpanded] = useState(false)

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

  const readiness = analysis.releaseReadiness

  // Fallback: if evaluator wasn't run (e.g. old mock result without evaluator),
  // show a minimal view from the raw releaseReadiness block.
  if (!readiness || !readiness.blockers) {
    const raw = analysis.releaseReadiness || {}
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
            <div className="readiness-badge-orb amber"><CircleAlert size={28} /></div>
            <div>
              <span className="eyebrow">Release Decision Status</span>
              <h2>{raw.status || 'REVIEW NEEDED'}</h2>
              <p>{raw.summaryText || raw.summary}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isBlocking = readiness.classification === CLASS.BLOCKING
  const statusColor = isBlocking ? 'red' : readiness.status === READINESS_STATUS.READY ? 'green' : 'amber'

  const heroBorderColor =
    statusColor === 'red' ? 'rgba(239,68,68,0.35)' :
    statusColor === 'green' ? 'rgba(16,185,129,0.35)' :
    'rgba(245,158,11,0.35)'

  const heroGradient =
    statusColor === 'red'
      ? 'linear-gradient(135deg, rgba(239,68,68,0.07), rgba(18,24,31,0.9))'
      : statusColor === 'green'
      ? 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(18,24,31,0.9))'
      : 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(18,24,31,0.8))'

  const orbClass =
    statusColor === 'red' ? 'rr-orb-red' :
    statusColor === 'green' ? 'rr-orb-green' :
    'rr-orb-amber'

  const OrbIcon = isBlocking ? XCircle : statusColor === 'green' ? CheckCircle : CircleAlert

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="readiness"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      {/* ── Analysis source banner ── */}
      <section
        className="panel"
        style={{
          padding: '0.75rem 1.25rem',
          marginBottom: '1.25rem',
          borderColor: 'rgba(56,189,248,0.25)',
          background: 'rgba(15,23,42,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
              <Bot size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
                Assessment Source: {readiness.assessmentSource || 'IBM Bob'}
              </strong>
              <br />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {readiness.note}
              </small>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <StatusBadge tone="red" dot={false}>{readiness.counts.blocking} Blocking</StatusBadge>
            <StatusBadge tone="amber" dot={false}>{readiness.counts.reviewNeeded} Review Needed</StatusBadge>
            <StatusBadge tone="neutral" dot={false}>{readiness.counts.informational} Informational</StatusBadge>
          </div>
        </div>
      </section>

      {/* ── Hero: overall status ── */}
      <div
        className="rr-hero panel"
        style={{ borderColor: heroBorderColor, background: heroGradient }}
      >
        <div className="rr-hero-left">
          <div className={`rr-status-orb ${orbClass}`}>
            <OrbIcon size={30} />
          </div>
          <div>
            <span className="eyebrow">Release Decision</span>
            <h2 className="rr-status-headline">{readiness.statusLabel}</h2>
            <p className="rr-status-summary">{readiness.summary}</p>
          </div>
        </div>
        <div className="rr-hero-stats">
          <div className="rr-stat-pill rr-stat-red">
            <strong>{readiness.counts.blocking}</strong>
            <span>Blockers</span>
          </div>
          <div className="rr-stat-pill rr-stat-amber">
            <strong>{readiness.counts.reviewNeeded}</strong>
            <span>Review Needed</span>
          </div>
          <div className="rr-stat-pill rr-stat-muted">
            <strong>{readiness.testReadiness.validTestCount} / {readiness.testReadiness.totalTestScenarios}</strong>
            <span>Test Scenarios Valid</span>
          </div>
        </div>
      </div>

      {/* ── Blocking issues ── */}
      <section className="panel" style={{ marginTop: '1.25rem' }}>
        <SectionHeading
          eyebrow="Critical path"
          title="Blocking Issues"
          action={
            <StatusBadge tone="red" dot={false}>
              <XCircle size={13} /> {readiness.counts.blocking} Unresolved
            </StatusBadge>
          }
        />
        <div className="panel-body">
          <p className="panel-desc">
            Each of the following issues independently prevents declaring the change release-ready.
            They are grounded in specific, named evidence from the IBM Bob source-code analysis.
            A finding is BLOCKING only when it causes a concrete structural failure — not merely because it sounds important.
          </p>
          <div className="rr-blocker-list">
            {readiness.blockers.map((b) => (
              <BlockerCard key={b.id} blocker={b} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Review required & Test readiness (2-column) ── */}
      <div className="results-grid" style={{ marginTop: '1.25rem' }}>

        {/* Review required */}
        <section className="panel">
          <SectionHeading
            eyebrow="Human judgement required"
            title="Review-Required Findings"
            action={
              <StatusBadge tone="amber" dot={false}>{readiness.counts.reviewNeeded} Items</StatusBadge>
            }
          />
          <div className="panel-body">
            <p className="panel-desc">
              These depend on architectural decisions not yet made or require human code review after
              implementation. They are not independent blockers today but must be resolved before release.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {readiness.reviewItems.map((item) => (
                <ReviewCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* Test readiness */}
        <section className="panel">
          <SectionHeading
            eyebrow="Coverage assessment"
            title="Test Readiness"
            action={
              <StatusBadge tone="red" dot={false}>
                {readiness.testReadiness.validTestCount} / {readiness.testReadiness.totalTestScenarios} Valid
              </StatusBadge>
            }
          />
          <div className="panel-body">
            <div
              className="rr-test-verdict"
              style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}
            >
              <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.2rem' }}>
                  Zero valid OAuth test coverage
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {readiness.testReadiness.summary}
                </p>
              </div>
            </div>
            {readiness.testReadiness.domains.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {readiness.testReadiness.domains.map((d, i) => (
                  <TestDomainRow key={i} domain={d} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Required actions ── */}
      {readiness.requiredActions.length > 0 && (
        <section className="panel" style={{ marginTop: '1.25rem' }}>
          <SectionHeading
            eyebrow="Pre-release checklist"
            title="Required Actions Before Release"
            action={
              <button
                className="text-button"
                onClick={() => setActionsExpanded((v) => !v)}
              >
                {actionsExpanded ? 'Collapse' : 'Expand all phases'}
                {actionsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            }
          />
          <div className="panel-body">
            <p className="panel-desc">
              {readiness.requiredActions.reduce((sum, p) => sum + p.actions.length, 0)} actions across{' '}
              {readiness.requiredActions.length} phases. None of these actions have been completed.
            </p>
            <div className="rr-phases">
              {readiness.requiredActions.map((phase) => (
                <div key={phase.phase} className="rr-phase">
                  <div className="rr-phase-header">
                    <span className="rr-phase-badge">Phase {phase.phase}</span>
                    <div>
                      <strong className="rr-phase-title">{phase.phaseTitle}</strong>
                      {phase.phaseNote && (
                        <span className="rr-phase-note"> — {phase.phaseNote}</span>
                      )}
                    </div>
                    <span className="rr-phase-count">{phase.actions.length} actions</span>
                  </div>
                  {actionsExpanded && (
                    <div className="rr-action-list">
                      {phase.actions.map((a) => (
                        <div key={a.id} className="rr-action-item">
                          <span className="rr-action-id">{a.id}</span>
                          <div className="rr-action-body">
                            <span>{a.action}</span>
                            {a.resolves && (
                              <code className="rr-resolves-tag">Resolves: {a.resolves}</code>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Informational findings ── */}
      {readiness.informationalItems.length > 0 && (
        <section className="panel" style={{ marginTop: '1.25rem' }}>
          <SectionHeading
            eyebrow="Scope & cleanup"
            title="Informational Findings"
            action={
              <button className="text-button" onClick={() => setInfExpanded((v) => !v)}>
                {infExpanded ? 'Collapse' : `Show ${readiness.informationalItems.length} items`}
                {infExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            }
          />
          <div className="panel-body">
            <p className="panel-desc">
              These observations describe the scope of the change or note cleanup tasks. They have no
              independent failure mode and do not require action before implementation begins.
            </p>
            {infExpanded && (
              <div className="rr-inf-list">
                {readiness.informationalItems.map((item) => (
                  <div key={item.id} className="rr-inf-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className="rr-action-id" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>{item.id}</span>
                      <strong style={{ fontSize: '0.85rem', color: '#f0f4f8' }}>{item.finding}</strong>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '2.4rem', lineHeight: 1.45 }}>{item.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Assessment limitations ── */}
      {readiness.limitations?.length > 0 && (
        <section className="panel" style={{ marginTop: '1.25rem', borderColor: 'rgba(255,255,255,0.06)' }}>
          <SectionHeading eyebrow="Epistemic boundaries" title="Assessment Limitations" />
          <div className="panel-body">
            <p className="panel-desc">
              These limitations bound the conclusions of this assessment. They are not findings — they
              are the boundaries of what static analysis can determine.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {readiness.limitations.map((lim) => (
                <div key={lim.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  <code style={{ color: '#38bdf8', flexShrink: 0, fontSize: '0.72rem' }}>{lim.id}</code>
                  <span>{lim.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ── Navigation footer ── */}
      <section className="quick-action" style={{ marginTop: '1.5rem' }}>
        <div className="quick-icon">
          <ShieldAlert size={21} />
        </div>
        <div>
          <span className="eyebrow">IMPACT — Analysis chain</span>
          <h2>Continue reviewing the analysis</h2>
          <p>Impact Map → Risk Analysis → Test Recommendations → Release Readiness</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="button ghost" onClick={() => onNavigate('impact')}>
            Impact Map <ArrowRight size={14} />
          </button>
          <button className="button ghost" onClick={() => onNavigate('risk')}>
            Risk Analysis <ArrowRight size={14} />
          </button>
          <button className="button primary" onClick={() => onNavigate('tests')}>
            Test Recommendations <ChevronRight size={15} />
          </button>
        </div>
      </section>
    </div>
  )
}
