import { Sparkles } from 'lucide-react'
import { pipelineStages } from '../data/mockData'

export function AnalysisPipeline({ stages = pipelineStages }) {
  return (
    <div className="pipeline-card" role="status" aria-live="polite">
      <div className="pipeline-heading">
        <span className="pipeline-orb">
          <Sparkles size={18} />
        </span>
        <div>
          <strong>Preparing your impact report</strong>
          <span>UI preview of the analysis workflow</span>
        </div>
      </div>
      <div className="pipeline-list">
        {stages.map((stage, index) => (
          <div className={`pipeline-stage stage-${index}`} key={stage}>
            <span className="pipeline-marker">{index + 1}</span>
            <span>{stage}</span>
            {index < stages.length - 1 && <i />}
          </div>
        ))}
      </div>
    </div>
  )
}
export default AnalysisPipeline
