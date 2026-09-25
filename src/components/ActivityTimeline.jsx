import { AlertTriangle, Check, CircleHelp, Sparkles } from 'lucide-react'

const iconMap = { check: Check, alert: AlertTriangle, scan: Sparkles }

export function ActivityTimeline({ items = [] }) {
  return (
    <div className="timeline">
      {items.map((item) => {
        const Icon = iconMap[item.icon] || CircleHelp
        return (
          <div className="timeline-item" key={`${item.title}-${item.time}`}>
            <span className={`timeline-icon ${item.icon}`}>
              <Icon size={14} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <time>{item.time}</time>
          </div>
        )
      })}
    </div>
  )
}
export default ActivityTimeline
