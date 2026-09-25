import {
  AlertTriangle, ArrowUpRight, Check, ChevronDown, CircleHelp, Clock3, FileCode2, GitBranch, LoaderCircle,
  MoreHorizontal, Search, ShieldCheck, Sparkles, Terminal, XCircle, Zap,
} from 'lucide-react'

const iconMap = { check: Check, alert: AlertTriangle, scan: Sparkles }

export function Logo() {
  return <div className="brand"><span className="brand-mark"><span /></span><span>IMPACT</span></div>
}

export function StatusBadge({ children, tone = 'neutral', dot = true }) {
  return <span className={`status-badge ${tone}`}>{dot && <i className="status-dot" />}{children}</span>
}

export function RiskBadge({ risk }) {
  const tone = risk === 'High' ? 'red' : risk === 'Medium' ? 'amber' : 'green'
  return <StatusBadge tone={tone}>{risk} risk</StatusBadge>
}

export function MetricCard({ metric }) {
  return <article className={`metric-card ${metric.tone}`}>
    <div className="metric-top"><span>{metric.label}</span><ArrowUpRight size={15} /></div>
    <strong>{metric.value}</strong>
    <div className="metric-foot"><span className="metric-delta">{metric.delta}</span><span>{metric.detail}</span></div>
  </article>
}

export function SectionHeading({ eyebrow, title, action }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>
}

export function SelectField({ label, value, options = [], onChange }) {
  return <label className="field"><span>{label}</span><div className="select-wrap"><select value={value} onChange={(event) => onChange?.(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={15} /></div></label>
}

export function AnalysisTable({ analyses, onView }) {
  return <div className="table-scroll"><table><thead><tr><th>Change</th><th>Repository</th><th>Files affected</th><th>Risk</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{analyses.map((analysis) => <tr className="analysis-row" key={analysis.id} onClick={() => onView?.(analysis)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onView?.(analysis) }} tabIndex={0}><td><strong>{analysis.change}</strong><span className="table-id">#{String(analysis.id).padStart(4, '0')}</span></td><td><span className="repo-cell"><GitBranch size={13} />{analysis.repo}</span></td><td><span className="file-count"><FileCode2 size={14} />{analysis.files}</span></td><td><RiskBadge risk={analysis.risk} /></td><td><StatusBadge tone={analysis.status === 'Ready to ship' ? 'green' : 'amber'}>{analysis.status}</StatusBadge></td><td className="muted-cell">{analysis.date}</td><td><button className="icon-button" aria-label={`Open analysis: ${analysis.change}`} onClick={(event) => { event.stopPropagation(); onView?.(analysis) }}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div>
}

export function ActivityTimeline({ items }) {
  return <div className="timeline">{items.map((item) => { const Icon = iconMap[item.icon] || CircleHelp; return <div className="timeline-item" key={`${item.title}-${item.time}`}><span className={`timeline-icon ${item.icon}`}><Icon size={14} /></span><div><strong>{item.title}</strong><p>{item.detail}</p></div><time>{item.time}</time></div> })}</div>
}

export function ImpactNode({ label, value, tone = 'cyan', last = false }) {
  return <div className="impact-step"><div className={`impact-node ${tone}`}><span className="node-kicker">{label}</span><strong>{value}</strong></div>{!last && <div className="node-connector"><span /></div>}</div>
}

export function LoadingState() {
  return <div className="loading-state"><LoaderCircle className="spin" size={28} /><strong>Mapping change impact</strong><span>Reviewing repository relationships and test coverage...</span></div>
}

export function AnalysisPipeline() {
  const stages = ['Repository', 'Understanding structure', 'Tracing dependencies', 'Checking risks', 'Preparing tests', 'Impact report']
  return <div className="pipeline-card" role="status" aria-live="polite"><div className="pipeline-heading"><span className="pipeline-orb"><Sparkles size={18} /></span><div><strong>Preparing your impact report</strong><span>UI preview of the analysis workflow</span></div></div><div className="pipeline-list">{stages.map((stage, index) => <div className={`pipeline-stage stage-${index}`} key={stage}><span className="pipeline-marker">{index + 1}</span><span>{stage}</span>{index < stages.length - 1 && <i />}</div>)}</div></div>
}

export function EmptyState({ title = 'Nothing here yet', detail = 'New activity will appear here.', action }) {
  return <div className="empty-state"><ShieldCheck size={25} /><div><strong>{title}</strong><span>{detail}</span></div>{action}</div>
}

export { AlertTriangle, Check, Clock3, FileCode2, GitBranch, Search, ShieldCheck, Sparkles, Terminal, XCircle, Zap }
