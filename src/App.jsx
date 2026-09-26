import { useState } from 'react'
import './App.css'
import './polish.css'
import { AnalysisPipeline, Sidebar, Topbar } from './components'
import { useAnalysis } from './hooks/useAnalysis'
import { repositories } from './data/repositories'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage from './pages/AnalyzePage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import ImpactMapPage from './pages/ImpactMapPage'
import RiskAnalysisPage from './pages/RiskAnalysisPage'
import TestRecommendationsPage from './pages/TestRecommendationsPage'
import ReleaseReadinessPage from './pages/ReleaseReadinessPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRepository, setSelectedRepository] = useState(repositories[0])
  const { analysis, isLoading, analyze } = useAnalysis()

  const navigate = (nextPage) => {
    setPage(nextPage)
    setSidebarOpen(false)
  }

  const handleSelectRepository = (repo) => {
    setSelectedRepository(repo)
  }

  const handleAnalyze = async (input) => {
    await analyze(input)
    setPage('results')
  }

  const viewAnalysis = () => {
    if (!analysis) {
      handleAnalyze({
        repository: selectedRepository.name,
        branch: selectedRepository.branch,
        changeDescription: 'Replace the existing JWT authentication system with OAuth 2.0 authentication.',
      })
    } else {
      setPage('results')
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <button
          className="drawer-scrim"
          aria-label="Dismiss navigation drawer"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-area">
        <Topbar
          selectedRepository={selectedRepository}
          onSelectRepo={handleSelectRepository}
          onNavigate={navigate}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        {isLoading ? (
          <div className="page-content">
            <AnalysisPipeline />
          </div>
        ) : page === 'dashboard' ? (
          <DashboardPage onNavigate={navigate} onViewAnalysis={viewAnalysis} />
        ) : page === 'analyze' ? (
          <AnalyzePage
            selectedRepository={selectedRepository}
            onAnalyze={handleAnalyze}
            isAnalyzing={isLoading}
          />
        ) : page === 'results' ? (
          <AnalysisResultsPage
            analysis={analysis}
            onBack={() => navigate('dashboard')}
            onNavigate={navigate}
          />
        ) : page === 'impact' ? (
          <ImpactMapPage analysis={analysis} onNavigate={navigate} />
        ) : page === 'risk' ? (
          <RiskAnalysisPage analysis={analysis} onNavigate={navigate} />
        ) : page === 'tests' ? (
          <TestRecommendationsPage analysis={analysis} onNavigate={navigate} />
        ) : page === 'readiness' ? (
          <ReleaseReadinessPage analysis={analysis} onNavigate={navigate} />
        ) : page === 'history' ? (
          <HistoryPage onNavigate={navigate} onViewAnalysis={viewAnalysis} />
        ) : (
          <SettingsPage />
        )}
      </div>
    </div>
  )
}

export default App
