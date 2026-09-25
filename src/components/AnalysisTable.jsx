import { FileCode2, GitBranch, MoreHorizontal } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { RiskBadge } from './RiskBadge'

export function AnalysisTable({ analyses = [], onView }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Change</th>
            <th>Repository</th>
            <th>Files affected</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {analyses.map((analysis) => (
            <tr
              className="analysis-row"
              key={analysis.id}
              onClick={() => onView?.(analysis)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onView?.(analysis)
              }}
              tabIndex={0}
            >
              <td>
                <strong>{analysis.change}</strong>
                <span className="table-id">#{String(analysis.id).padStart(4, '0')}</span>
              </td>
              <td>
                <span className="repo-cell">
                  <GitBranch size={13} />
                  {analysis.repo}
                </span>
              </td>
              <td>
                <span className="file-count">
                  <FileCode2 size={14} />
                  {analysis.files}
                </span>
              </td>
              <td>
                <RiskBadge risk={analysis.risk} />
              </td>
              <td>
                <StatusBadge tone={analysis.status === 'Ready to ship' ? 'green' : 'amber'}>
                  {analysis.status}
                </StatusBadge>
              </td>
              <td className="muted-cell">{analysis.date}</td>
              <td>
                <button
                  className="icon-button"
                  aria-label={`Open analysis: ${analysis.change}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onView?.(analysis)
                  }}
                >
                  <MoreHorizontal size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default AnalysisTable
