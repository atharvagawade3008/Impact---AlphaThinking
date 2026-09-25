export function StatusBadge({ children, tone = 'neutral', dot = true }) {
  return (
    <span className={`status-badge ${tone}`}>
      {dot && <i className="status-dot" />}
      {children}
    </span>
  )
}
export default StatusBadge
