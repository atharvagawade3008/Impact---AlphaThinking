import { useState } from 'react'
import { ChevronDown, GitBranch, Menu, Search, Sparkles } from 'lucide-react'
import { repositories, getDefaultRepository } from '../data/repositories'

export function Topbar({
  selectedRepository = getDefaultRepository(),
  onSelectRepo,
  onNavigate,
  onOpenMenu,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const currentRepo = selectedRepository || getDefaultRepository()
  const avatarText = currentRepo.name.slice(0, 2).toUpperCase()

  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={onOpenMenu}>
        <Menu size={19} />
      </button>

      <div className="repo-selector-wrapper" style={{ position: 'relative' }}>
        <div
          className="repo-selector"
          onClick={() => setDropdownOpen((prev) => !prev)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <span className="repo-avatar">{avatarText}</span>
          <div>
            <span>Repository</span>
            <strong>{currentRepo.name}</strong>
          </div>
          <ChevronDown size={15} />
        </div>

        {dropdownOpen && (
          <div
            className="panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 100,
              minWidth: '240px',
              padding: '0.5rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Select repository
            </div>
            {repositories.map((repo) => (
              <button
                key={repo.id}
                className="button ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  fontWeight: repo.id === currentRepo.id ? '600' : '400',
                  color: repo.id === currentRepo.id ? 'var(--accent-color, #38bdf8)' : 'inherit',
                }}
                onClick={() => {
                  if (onSelectRepo) onSelectRepo(repo)
                  setDropdownOpen(false)
                }}
              >
                <div>
                  <div>{repo.name}</div>
                  <small style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                    {repo.technology.slice(0, 2).join(', ')}
                  </small>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="branch-pill">
        <GitBranch size={14} /> {currentRepo.branch}
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
