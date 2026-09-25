import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { pipelineStages } from '../data/mockData'

export function AnalysisPipeline({ stages = pipelineStages }) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < stages.length - 1) return prev + 1
        return prev
      })
    }, 400)
    return () => clearInterval(interval)
  }, [stages.length])

  return (
    <div className="pipeline-card" role="status" aria-live="polite">
      <div className="pipeline-heading">
        <span className="pipeline-orb">
          <Sparkles size={18} className="spin-slow" />
        </span>
        <div>
          <strong>Evaluating change impact</strong>
          <span>IBM Bob mock engine is analyzing code relationships...</span>
        </div>
      </div>
      <div className="pipeline-list">
        {stages.map((stage, index) => {
          const isDone = index < currentStep
          const isCurrent = index === currentStep
          return (
            <div
              className={`pipeline-stage stage-${index} ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}
              key={stage}
            >
              <span className="pipeline-marker">{isDone ? '✓' : index + 1}</span>
              <span>{stage}</span>
              {index < stages.length - 1 && <i />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default AnalysisPipeline
