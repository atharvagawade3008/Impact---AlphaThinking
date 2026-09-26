import { useState } from 'react'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileCode,
  GitBranch,
  Layers,
  ShieldAlert,
  SlidersHorizontal,
  Workflow,
  Zap,
} from 'lucide-react'
import { AnalysisResultHeader, EmptyState, ImpactNode, SectionHeading, StatusBadge } from '../components'

export default function ImpactMapPage({ analysis, onNavigate }) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'direct' | 'indirect' | 'modules' | 'apis'

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

  const impactData = analysis.impact || {}
  const nodes = impactData.nodes || [
    { label: 'Proposed Change', value: analysis.scenarioTitle || 'OAuth 2.0 Migration', tone: 'cyan' },
    { label: 'Direct Service', value: 'Authentication (authService.js)', tone: 'blue' },
    { label: 'Auth Middleware', value: 'authMiddleware.js', tone: 'amber' },
    { label: 'Protected API Routes', value: 'User / Order / Payment Routes', tone: 'amber' },
    { label: 'Recommended Tests', value: `${analysis.tests?.length || 13} Tests`, tone: 'green', last: true },
  ]

  const directlyAffected = impactData.directlyAffectedFiles || []
  const indirectlyAffected = impactData.indirectlyAffectedFiles || []
  const affectedModules = impactData.affectedModules || []
  const affectedAPIs = impactData.affectedAPIs || []
  const dependencyLayers = impactData.dependencyLayers || []

  return (
    <div className="page-content results-page">
      <AnalysisResultHeader
        analysis={analysis}
        activeTab="impact"
        onNavigate={onNavigate}
        onBack={() => onNavigate('dashboard')}
      />

      {/* IBM Bob Source Metadata Banner */}
      <section className="panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(15, 23, 42, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Analysis Source: {analysis.analysisSource || 'IBM Bob'}</strong>
                <span className="layer-badge cyan" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                  Static Code Inspection
                </span>
              </div>
              <small style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                {analysis.generatedBy || 'Derived from source code inspection'}
              </small>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span><GitBranch size={13} style={{ display: 'inline', marginRight: '3px' }} /> {analysis.repository} ({analysis.branch})</span>
            <span><Workflow size={13} style={{ display: 'inline', marginRight: '3px' }} /> {directlyAffected.length} Direct / {indirectlyAffected.length} Indirect Files</span>
          </div>
        </div>
      </section>

      {/* Visual Relationship Pipeline Nodes */}
      <section className="panel impact-map-panel">
        <SectionHeading
          eyebrow="Architectural Change Propagation"
          title="Technical Impact Chain"
          action={<span className="muted-label">{nodes.length} Relationship Stages Mapped</span>}
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

      {/* Impact Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.25rem 0 0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="filter-tabs" style={{ background: 'var(--bg-card, #111827)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #1f2937)' }}>
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            All Surfaces ({directlyAffected.length + indirectlyAffected.length})
          </button>
          <button
            className={activeTab === 'direct' ? 'active' : ''}
            onClick={() => setActiveTab('direct')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            Direct Impact ({directlyAffected.length})
          </button>
          <button
            className={activeTab === 'indirect' ? 'active' : ''}
            onClick={() => setActiveTab('indirect')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            Indirect Impact ({indirectlyAffected.length})
          </button>
          <button
            className={activeTab === 'modules' ? 'active' : ''}
            onClick={() => setActiveTab('modules')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            Modules ({affectedModules.length})
          </button>
          <button
            className={activeTab === 'apis' ? 'active' : ''}
            onClick={() => setActiveTab('apis')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            API Endpoints ({affectedAPIs.length})
          </button>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing IBM Bob analysis details
        </span>
      </div>

      {/* Main Impact Map Content Grid */}
      <div className="results-grid" style={{ gridTemplateColumns: activeTab === 'all' || activeTab === 'direct' || activeTab === 'indirect' ? '2fr 1fr' : '1fr' }}>
        
        {/* Left Column: Direct vs Indirect File Analysis Cards */}
        {(activeTab === 'all' || activeTab === 'direct' || activeTab === 'indirect') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* DIRECT IMPACT SECTION */}
            {(activeTab === 'all' || activeTab === 'direct') && (
              <section className="panel">
                <SectionHeading
                  eyebrow="Primary Boundary"
                  title="Direct Impact — Files Requiring Code Rewrite"
                  action={
                    <StatusBadge tone="red">{directlyAffected.length} Direct Files</StatusBadge>
                  }
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {directlyAffected.map((file) => (
                    <div
                      key={file.path}
                      className="panel-sub"
                      style={{
                        padding: '0.85rem 1rem',
                        borderLeft: '3px solid #ef4444',
                        background: 'rgba(239, 68, 68, 0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileCode size={16} style={{ color: '#ef4444' }} />
                          <code style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{file.path}</code>
                        </div>
                        <StatusBadge tone="red">Direct Code Rewrite</StatusBadge>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', lineHeight: '1.4', margin: 0 }}>
                        {file.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* INDIRECT IMPACT SECTION */}
            {(activeTab === 'all' || activeTab === 'indirect') && (
              <section className="panel">
                <SectionHeading
                  eyebrow="Downstream Propagation"
                  title="Indirect Impact — Downstream Files & Test Suite"
                  action={
                    <StatusBadge tone="amber">{indirectlyAffected.length} Indirect Files</StatusBadge>
                  }
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {indirectlyAffected.map((file) => (
                    <div
                      key={file.path}
                      className="panel-sub"
                      style={{
                        padding: '0.85rem 1rem',
                        borderLeft: '3px solid #f59e0b',
                        background: 'rgba(245, 158, 11, 0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileCode size={16} style={{ color: '#f59e0b' }} />
                          <code style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{file.path}</code>
                        </div>
                        <StatusBadge tone={file.path.includes('tests/') ? 'red' : 'amber'}>
                          {file.path.includes('tests/') ? 'Test Harness Impact' : 'Downstream Dependency'}
                        </StatusBadge>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', lineHeight: '1.4', margin: 0 }}>
                        {file.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Right Column / Side Panel: 4-Level Propagation Layers Summary */}
        {(activeTab === 'all' || activeTab === 'direct' || activeTab === 'indirect') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <section className="panel">
              <SectionHeading eyebrow="Relationship Breakdown" title="Dependency Propagation" />
              <div className="dependency-layers">
                {dependencyLayers.map((layer) => (
                  <div className="layer-item" key={layer.level}>
                    <span className={`layer-badge ${layer.badgeTone || 'cyan'}`}>{layer.level}</span>
                    <div>
                      <strong>{layer.title}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        {layer.subtitle}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                        {layer.items?.slice(0, 4).map((item) => (
                          <code
                            key={item.name}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            {item.name}
                          </code>
                        ))}
                        {layer.items?.length > 4 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            +{layer.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <SectionHeading eyebrow="Surface Summary" title="Impact Metrics" />
              <div className="impact-metrics-list">
                <div className="impact-metric-row">
                  <span className="metric-label">Target Repository</span>
                  <span className="metric-val">{analysis.repository} ({analysis.branch})</span>
                </div>
                <div className="impact-metric-row">
                  <span className="metric-label">Direct Code Rewrite</span>
                  <span className="metric-val text-red">{directlyAffected.length} files</span>
                </div>
                <div className="impact-metric-row">
                  <span className="metric-label">Indirect Downstream Files</span>
                  <span className="metric-val text-amber">{indirectlyAffected.length} files</span>
                </div>
                <div className="impact-metric-row">
                  <span className="metric-label">Files Currently Changed</span>
                  <span className="metric-val text-cyan">0 (Uncommitted change)</span>
                </div>
                <div className="impact-metric-row">
                  <span className="metric-label">Verification Status</span>
                  <span className="metric-val text-amber">{analysis.verificationStatus || '0/13 verified (Not yet executed)'}</span>
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
        )}

        {/* MODULES TAB VIEW */}
        {activeTab === 'modules' && (
          <section className="panel">
            <SectionHeading eyebrow="Domain Surface" title="Affected Application Modules" />
            <div className="table-scroll" style={{ marginTop: '0.75rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Impact Level</th>
                    <th>IBM Bob Analysis Finding</th>
                  </tr>
                </thead>
                <tbody>
                  {affectedModules.map((module) => (
                    <tr key={module.name}>
                      <td>
                        <strong style={{ fontSize: '0.85rem' }}>{module.name}</strong>
                      </td>
                      <td>
                        <StatusBadge
                          tone={module.impact === 'DIRECT' ? 'red' : module.impact === 'INDIRECT' ? 'amber' : 'neutral'}
                        >
                          {module.impact} IMPACT
                        </StatusBadge>
                      </td>
                      <td className="muted-cell">{module.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* APIS TAB VIEW */}
        {activeTab === 'apis' && (
          <section className="panel">
            <SectionHeading eyebrow="HTTP Surface" title="Affected API Endpoints" />
            <div className="table-scroll" style={{ marginTop: '0.75rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Endpoint Path</th>
                    <th>Impact Level</th>
                    <th>IBM Bob Propagation Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {affectedAPIs.map((api, idx) => (
                    <tr key={idx}>
                      <td>
                        <code
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: api.method === 'POST' ? '#38bdf8' : api.method === 'PUT' ? '#f59e0b' : '#34d399',
                          }}
                        >
                          {api.method}
                        </code>
                      </td>
                      <td>
                        <code className="file-code">{api.path}</code>
                      </td>
                      <td>
                        <StatusBadge
                          tone={api.impact === 'DIRECT' ? 'red' : api.impact === 'INDIRECT' ? 'amber' : 'neutral'}
                        >
                          {api.impact}
                        </StatusBadge>
                      </td>
                      <td className="muted-cell">{api.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
