import { ArrowUpRight } from 'lucide-react'

export function MetricCard({ metric }) {
  return (
    <article className={`metric-card ${metric.tone}`}>
      <div className="metric-top">
        <span>{metric.label}</span>
        <ArrowUpRight size={15} />
      </div>
      <strong>{metric.value}</strong>
      <div className="metric-foot">
        <span className="metric-delta">{metric.delta}</span>
        <span>{metric.detail}</span>
      </div>
    </article>
  )
}
export default MetricCard
