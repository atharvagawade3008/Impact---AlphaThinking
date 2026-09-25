import { StatusBadge } from './StatusBadge'

export function RiskBadge({ risk }) {
  const tone = risk === 'High' ? 'red' : risk === 'Medium' ? 'amber' : 'green'
  return <StatusBadge tone={tone}>{risk} risk</StatusBadge>
}
export default RiskBadge
