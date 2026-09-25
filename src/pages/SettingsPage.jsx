import { Bell, ChevronRight, GitBranch, Palette, Plug, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '../components'
import { settingsItems } from '../data/mockData'

const iconMap = [GitBranch, SlidersHorizontal, Bell, Plug, Palette]

export default function SettingsPage() {
  return (
    <div className="page-content narrow-page">
      <PageHeader
        eyebrow="Workspace / Configuration"
        title="Settings"
        description="Shape how IMPACT fits into your team’s development workflow."
      />
      <section className="settings-list panel">
        {settingsItems.map((item, index) => {
          const Icon = iconMap[index] || Plug
          return (
            <button className="setting-row" key={item.title}>
              <span className="setting-icon">
                <Icon size={17} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
              <span className="setting-value">
                {index === 4 ? 'Dark' : 'Configure'} <ChevronRight size={16} />
              </span>
            </button>
          )
        })}
      </section>
      <div className="settings-note">
        <Plug size={16} />
        <span>IBM Bob is ready to connect when the analysis pipeline is available.</span>
      </div>
    </div>
  )
}
