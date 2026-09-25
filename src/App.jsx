import { useState } from 'react'
import { Activity, BookOpenCheck, Box, ChevronDown, CircleHelp, Clock3, GitBranch, LayoutDashboard, Menu, Search, Settings, ShieldAlert, Sparkles, X } from 'lucide-react'
import './App.css'
import './polish.css'
import { AnalysisPipeline, Logo } from './components/ui'
import { analyzeChange } from './services/analysisService'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage from './pages/AnalyzePage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'analyze', label: 'Analyze change', icon: Sparkles },
  { id: 'impact', label: 'Impact map', icon: Box, disabled: true }, { id: 'risk', label: 'Risk analysis', icon: ShieldAlert, disabled: true },
  { id: 'tests', label: 'Test recommendations', icon: BookOpenCheck, disabled: true }, { id: 'readiness', label: 'Release readiness', icon: Activity, disabled: true },
  { id: 'history', label: 'Analysis history', icon: Clock3 },
]

function Sidebar({ page, onNavigate, open, onClose }) {
  return <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation"><div className="sidebar-top"><Logo /><button className="mobile-close icon-button" aria-label="Close navigation" onClick={onClose}><X size={18} /></button></div><div className="workspace-label">WORKSPACE</div><nav>{navItems.map(({ id, label, icon: Icon, disabled }) => <button className={`nav-item ${page === id ? 'active' : ''} ${disabled ? 'disabled' : ''}`} disabled={disabled} key={id} onClick={() => onNavigate(id)}><Icon size={17} /><span>{label}</span>{disabled && <span className="soon">Soon</span>}</button>)}</nav><div className="sidebar-bottom"><div className="bob-status"><span className="online-dot" /><div><strong>IBM Bob</strong><span>Connected · mock mode</span></div><CircleHelp size={14} aria-label="IBM Bob status" /></div><button className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}><Settings size={17} /><span>Settings</span></button><div className="profile"><span className="avatar">JD</span><div><strong>Jordan Davis</strong><span>Platform team</span></div><ChevronDown size={14} /></div></div></aside>
}

function Topbar({ onNavigate, onOpenMenu }) {
  return <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={onOpenMenu}><Menu size={19} /></button><div className="repo-selector"><span className="repo-avatar">AC</span><div><span>Repository</span><strong>acme-commerce / checkout</strong></div><ChevronDown size={15} /></div><div className="branch-pill"><GitBranch size={14} /> main</div><div className="topbar-spacer" /><button className="top-icon icon-button" aria-label="Search"><Search size={17} /></button><span className="top-status"><span className="online-dot" /> Systems nominal</span><button className="button primary compact" onClick={() => onNavigate('analyze')}><Sparkles size={15} /> New analysis</button></header>
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = (nextPage) => { if (['impact', 'risk', 'tests', 'readiness'].includes(nextPage)) return; setPage(nextPage); setSidebarOpen(false) }
  const handleAnalyze = async (input) => { setIsLoading(true); const result = await analyzeChange(input); setAnalysis(result); setIsLoading(false); setPage('results') }
  const viewAnalysis = () => { if (!analysis) handleAnalyze({ repository: 'platform / identity-service', branch: 'develop', change: 'Replace the existing authentication system with OAuth 2.0.' }); else setPage('results') }
  return <div className="app-shell"><Sidebar page={page === 'results' ? 'dashboard' : page} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />{sidebarOpen && <button className="drawer-scrim" aria-label="Dismiss navigation drawer" onClick={() => setSidebarOpen(false)} />}<div className="main-area"><Topbar onNavigate={navigate} onOpenMenu={() => setSidebarOpen(true)} />{isLoading ? <div className="page-content"><AnalysisPipeline /></div> : page === 'dashboard' ? <DashboardPage onNavigate={navigate} onViewAnalysis={viewAnalysis} /> : page === 'analyze' ? <AnalyzePage onAnalyze={handleAnalyze} isAnalyzing={isLoading} /> : page === 'results' ? <AnalysisResultsPage analysis={analysis} onBack={() => navigate('dashboard')} onNavigate={navigate} /> : page === 'history' ? <HistoryPage onNavigate={navigate} onViewAnalysis={viewAnalysis} /> : <SettingsPage />}</div></div>
}

export default App
