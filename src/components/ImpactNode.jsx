export function ImpactNode({ label, value, tone = 'cyan', last = false }) {
  return (
    <div className="impact-step">
      <div className={`impact-node ${tone}`}>
        <span className="node-kicker">{label}</span>
        <strong>{value}</strong>
      </div>
      {!last && (
        <div className="node-connector">
          <span />
        </div>
      )}
    </div>
  )
}
export default ImpactNode
