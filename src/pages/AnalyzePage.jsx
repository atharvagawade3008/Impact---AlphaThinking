import { useState } from 'react'
import { ArrowRight, GitPullRequest, Info, Sparkles, Layers } from 'lucide-react'
import { repositories, getRepositoryById } from '../data/repositories'
import { changeScenarios, getDefaultScenario } from '../data/changeScenarios'
import { PageHeader, SelectField } from '../components'

export default function AnalyzePage({ onAnalyze, isAnalyzing = false, selectedRepository }) {
  const defaultRepo = selectedRepository || repositories[0]
  const defaultScenario = getDefaultScenario()

  const [selectedRepoId, setSelectedRepoId] = useState(defaultRepo.id)
  const currentRepo = getRepositoryById(selectedRepoId)

  const [branch, setBranch] = useState(currentRepo.branch)
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenario.id)
  const [change, setChange] = useState(defaultScenario.changeDescription)
  const [pr, setPr] = useState('')
  const [context, setContext] = useState(defaultScenario.defaultContext)
  const [error, setError] = useState('')

  const handleScenarioChange = (scenarioId) => {
    setSelectedScenarioId(scenarioId)
    const foundScenario = changeScenarios.find((s) => s.id === scenarioId)
    if (foundScenario) {
      setChange(foundScenario.changeDescription)
      setContext(foundScenario.defaultContext || '')
      if (error) setError('')
    }
  }

  const submit = (event) => {
    event.preventDefault()
    if (!change.trim()) {
      setError('Describe the proposed change before continuing.')
      return
    }
    setError('')
    onAnalyze({
      repository: currentRepo.name,
      repositoryId: currentRepo.id,
      branch,
      changeDescription: change,
      scenarioId: selectedScenarioId,
      pr,
      context,
    })
  }

  return (
    <div className="page-content narrow-page">
      <PageHeader
        eyebrow="Impact analysis / New"
        title="Analyze a proposed change"
        description="Give IMPACT the context it needs to map what could move with your code in ShopFlow."
      />
      <form className="analysis-form panel" onSubmit={submit}>
        <div className="form-intro">
          <div className="form-icon">
            <Sparkles size={19} />
          </div>
          <div>
            <h2>Change context</h2>
            <p>
              Targeting <strong>{currentRepo.name}</strong> ({currentRepo.technology.join(', ')}).
              Select a realistic scenario or enter custom proposed changes.
            </p>
          </div>
        </div>

        <div className="form-row">
          <SelectField
            label="Repository"
            value={currentRepo.id}
            options={repositories.map((item) => ({ label: `${item.name} (${item.branch})`, value: item.id }))}
            onChange={(val) => {
              setSelectedRepoId(val)
              const matched = getRepositoryById(val)
              setBranch(matched.branch)
            }}
          />
          <SelectField
            label="Branch"
            value={branch}
            options={[currentRepo.branch, 'feature/oauth-migration', 'staging']}
            onChange={setBranch}
          />
        </div>

        <div className="field">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Layers size={15} /> Select ShopFlow Change Scenario
          </span>
          <select
            value={selectedScenarioId}
            onChange={(e) => handleScenarioChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'var(--bg-card, #111827)',
              color: 'var(--text-primary, #f9fafb)',
              border: '1px solid var(--border-color, #1f2937)',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            {changeScenarios.map((scen) => (
              <option key={scen.id} value={scen.id}>
                [{scen.id}] {scen.title}
              </option>
            ))}
          </select>
          <small className="field-hint">
            <span>Choose from ground-truth scenarios defined for the current ShopFlow target repository.</span>
          </small>
        </div>

        <label className="field">
          <span>
            Proposed change <em>Required</em>
          </span>
          <textarea
            rows="5"
            maxLength={500}
            value={change}
            onChange={(event) => {
              setChange(event.target.value)
              if (error) setError('')
            }}
            placeholder="Describe the code change you are planning..."
          />
          <small className="field-hint">
            <span>Example: Replace the existing JWT authentication system with OAuth 2.0 authentication.</span>
            <span>{change.length}/500</span>
          </small>
        </label>

        <label className="field">
          <span>
            Pull request / commit <em>Optional</em>
          </span>
          <div className="input-with-icon">
            <GitPullRequest size={16} />
            <input
              value={pr}
              onChange={(event) => setPr(event.target.value)}
              placeholder="e.g. PR #104 or commit SHA"
            />
          </div>
        </label>

        <label className="field">
          <span>
            Additional context <em>Optional</em>
          </span>
          <textarea
            rows="3"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="What else should the analysis know about protected routes or identity contract?"
          />
        </label>

        {error && (
          <div className="form-error">
            <Info size={16} />
            {error}
          </div>
        )}

        <div className="form-footer">
          <span>
            <Info size={15} /> Analysis targets actual ShopFlow repository structure
          </span>
          <button className="button primary" type="submit" disabled={isAnalyzing}>
            {isAnalyzing ? 'Preparing report...' : 'Analyze change'} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
