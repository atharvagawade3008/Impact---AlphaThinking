import { LoaderCircle } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="loading-state">
      <LoaderCircle className="spin" size={28} />
      <strong>Mapping change impact</strong>
      <span>Reviewing repository relationships and test coverage...</span>
    </div>
  )
}
export default LoadingState
