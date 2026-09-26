import { ShieldCheck } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', detail = 'New activity will appear here.', action }) {
  return (
    <div className="empty-state">
      <ShieldCheck size={25} />
      <div className="empty-state-text">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      {action}
    </div>
  )
}
export default EmptyState
