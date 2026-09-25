import {
  Activity, BookOpenCheck, Box, ChevronDown, CircleHelp, Clock3, LayoutDashboard,
  Settings, ShieldAlert, Sparkles, X,
} from 'lucide-react'
import { Logo } from './Logo'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyze change', icon: Sparkles },
  { id: 'impact', label: 'Impact map', icon: Box, disabled: true },
  { id: 'risk', label: 'Risk analysis', icon: ShieldAlert, disabled: true },
  { id: 'tests', label: 'Test recommendations', icon: BookOpenCheck, disabled: true },
  { id: 'readiness', label: 'Release readiness', icon: Activity, disabled: true },
  { id: 'history', label: 'Analysis history', icon: Clock3 },
]

export function Sidebar({ page, onNavigate, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation">
      <div className="sidebar-top">
        <Logo />
        <button className="mobile-close icon-button" aria-label="Close navigation" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>
        {navItems.map(({ id, label, icon: Icon, disabled }) => (
          <button
            className={`nav-item ${page === id ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            disabled={disabled}
            key={id}
            onClick={() => onNavigate(id)}
          >
            <Icon size={17} />
            <span>{label}</span>
            {disabled && <span className="soon">Soon</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="bob-status">
          <span className="online-dot" />
          <div>
            <strong>IBM Bob</strong>
            <span>Connected · mock mode</span>
          </div>
          <CircleHelp size={14} aria-label="IBM Bob status" />
        </div>
        <button
          className={`nav-item ${page === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <Settings size={17} />
          <span>Settings</span>
        </button>
        <div className="profile">
          <span className="avatar">JD</span>
          <div>
            <strong>Jordan Davis</strong>
            <span>Platform team</span>
          </div>
          <ChevronDown size={14} />
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
