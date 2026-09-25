import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import { RiskBadge } from './RiskBadge'

export function AnalysisResultHeader({ analysis, activeTab, onNavigate, onBack }) {
  if (!analysis) return null

  const tabs = [
    { id: 'results', label: 'Overview' },
    { id: 'impact', label: 'Impact Map' },
    { id: 'risk', label: 'Risk Analysis' },
    { id: 'tests', label: 'Recommended Tests' },
    { id: 'readiness', label: 'Release Readiness' },
  ]

  return (
    <div className="analysis-result-header">
      <div className="result-top">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <div className="result-actions">
          <button className="button ghost">
            Export report <ExternalLink size={14} />
          </button>
          <button className="button primary" onClick={() => onNavigate('analyze')}>
            <Sparkles size={14} /> New analysis
          </button>
        </div>
      </div>
      <div className="result-heading">
        <div>
          <span className="eyebrow">
            Analysis #{analysis.id} / Completed {analysis.timestamp}
          </span>
          <h1>{analysis.change}</h1>
          <div className="result-meta">
            <span>Repo: <strong>{analysis.repository}</strong></span>
            <span>Branch: <strong>{analysis.branch}</strong></span>
            <span>Mock Result</span>
          </div>
        </div>
        <RiskBadge risk={analysis.overallRisk} />
      </div>
      <div className="analysis-nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onNavigate(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
export default AnalysisResultHeader
