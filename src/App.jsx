import { useState } from 'react'
import './App.css'
import './polish.css'
import { AnalysisPipeline, Sidebar, Topbar } from './components'
import { useAnalysis } from './hooks/useAnalysis'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage from './pages/AnalyzePage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { analysis, isLoading, analyze } = useAnalysis()

  const navigate = (nextPage) => {
    if (['impact', 'risk', 'tests', 'readiness'].includes(nextPage)) return
    setPage(nextPage)
    setSidebarOpen(false)
  }

  const handleAnalyze = async (input) => {
    await analyze(input)
    setPage('results')
  }

  const viewAnalysis = () => {
    if (!analysis) {
      handleAnalyze({
        repository: 'platform / identity-service',
        branch: 'develop',
        changeDescription: 'Replace the existing authentication system with OAuth 2.0.',
      })
    } else {
      setPage('results')
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page === 'results' ? 'dashboard' : page}
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
        <Topbar onNavigate={navigate} onOpenMenu={() => setSidebarOpen(true)} />
        {isLoading ? (
          <div className="page-content">
            <AnalysisPipeline />
          </div>
        ) : page === 'dashboard' ? (
          <DashboardPage onNavigate={navigate} onViewAnalysis={viewAnalysis} />
        ) : page === 'analyze' ? (
          <AnalyzePage onAnalyze={handleAnalyze} isAnalyzing={isLoading} />
        ) : page === 'results' ? (
          <AnalysisResultsPage
            analysis={analysis}
            onBack={() => navigate('dashboard')}
            onNavigate={navigate}
          />
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
