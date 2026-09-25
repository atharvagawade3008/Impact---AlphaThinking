import { Download, Plus } from 'lucide-react'
import { AnalysisTable, EmptyState } from '../components/ui'
import { recentAnalyses } from '../data/mockData'

export default function HistoryPage({ onNavigate, onViewAnalysis }) {
  return <div className="page-content"><div className="page-header"><div><span className="eyebrow">Workspace / Archive</span><h1>Analysis history</h1><p>Review the impact reports your team has created across repositories.</p></div><div className="header-actions"><button className="button ghost"><Download size={15} /> Export</button><button className="button primary" onClick={() => onNavigate('analyze')}><Plus size={16} /> New analysis</button></div></div><section className="panel history-panel"><div className="filter-row"><div className="filter-tabs"><button className="active">All analyses <span>128</span></button><button>Needs review <span>12</span></button><button>Ready to ship <span>84</span></button></div><select><option>Last 30 days</option><option>Last 90 days</option></select></div><AnalysisTable analyses={recentAnalyses} onView={onViewAnalysis} /></section><div className="history-empty"><EmptyState title="Showing recent results" detail="Connect a repository to populate your full analysis archive." /></div></div>
}
