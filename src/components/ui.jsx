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
  return <div className="table-scroll"><table><thead><tr><th>Change</th><th>Repository</th><th>Files affected</th><th>Risk</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{analyses.map((analysis) => <tr key={analysis.id} onClick={() => onView?.(analysis)}><td><strong>{analysis.change}</strong><span className="table-id">#{String(analysis.id).padStart(4, '0')}</span></td><td><span className="repo-cell"><GitBranch size={13} />{analysis.repo}</span></td><td><span className="file-count"><FileCode2 size={14} />{analysis.files}</span></td><td><RiskBadge risk={analysis.risk} /></td><td><StatusBadge tone={analysis.status === 'Ready to ship' ? 'green' : 'amber'}>{analysis.status}</StatusBadge></td><td className="muted-cell">{analysis.date}</td><td><button className="icon-button" aria-label="Open analysis"><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div>
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

export function EmptyState({ title = 'Nothing here yet', detail = 'New activity will appear here.' }) {
  return <div className="empty-state"><ShieldCheck size={25} /><strong>{title}</strong><span>{detail}</span></div>
}

export { AlertTriangle, Check, Clock3, FileCode2, GitBranch, Search, ShieldCheck, Sparkles, Terminal, XCircle, Zap }
