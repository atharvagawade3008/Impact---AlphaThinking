import { ArrowRight, Plus, SlidersHorizontal } from 'lucide-react'
import { ActivityTimeline, AnalysisTable, MetricCard, PageHeader, SectionHeading } from '../components'
import { activity, recentAnalyses, summaryMetrics } from '../data/mockData'

export default function DashboardPage({ onNavigate, onViewAnalysis }) {
  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Overview / 25 Sep 2026"
        title="Change Impact Overview"
        description="Understand what your next code change could affect before you ship."
        action={
          <button className="button primary" onClick={() => onNavigate('analyze')}>
            <Plus size={17} /> New analysis
          </button>
        }
      />
      <div className="metric-grid">
        {summaryMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel analysis-panel">
          <SectionHeading
            eyebrow="Workspace activity"
            title="Recent analyses"
            action={
              <button className="text-button" onClick={() => onNavigate('history')}>
                View history <ArrowRight size={14} />
              </button>
            }
          />
          <AnalysisTable analyses={recentAnalyses} onView={onViewAnalysis} />
        </section>
        <section className="panel activity-panel">
          <SectionHeading
            eyebrow="Live feed"
            title="Recent activity"
            action={
              <button className="icon-button" aria-label="Filter activity">
                <SlidersHorizontal size={15} />
              </button>
            }
          />
          <ActivityTimeline items={activity} />
        </section>
      </div>
      <section className="quick-action">
        <div className="quick-icon">
          <ArrowRight size={21} />
        </div>
        <div>
          <span className="eyebrow">Start with a change</span>
          <h2>Analyze a new change</h2>
          <p>Surface affected services, risk, and the tests your team should run next.</p>
        </div>
        <button className="button secondary" onClick={() => onNavigate('analyze')}>
          Start analysis <ArrowRight size={15} />
        </button>
      </section>
    </div>
  )
}
