import { ChevronDown, GitBranch, Menu, Search, Sparkles } from 'lucide-react'

export function Topbar({ onNavigate, onOpenMenu }) {
  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={onOpenMenu}>
        <Menu size={19} />
      </button>
      <div className="repo-selector">
        <span className="repo-avatar">AC</span>
        <div>
          <span>Repository</span>
          <strong>acme-commerce / checkout</strong>
        </div>
        <ChevronDown size={15} />
      </div>
      <div className="branch-pill">
        <GitBranch size={14} /> main
      </div>
      <div className="topbar-spacer" />
      <button className="top-icon icon-button" aria-label="Search">
        <Search size={17} />
      </button>
      <span className="top-status">
        <span className="online-dot" /> Systems nominal
      </span>
      <button className="button primary compact" onClick={() => onNavigate('analyze')}>
        <Sparkles size={15} /> New analysis
      </button>
    </header>
  )
}
export default Topbar
