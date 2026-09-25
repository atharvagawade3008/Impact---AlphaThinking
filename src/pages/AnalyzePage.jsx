import { useState } from 'react'
import { ArrowRight, GitPullRequest, Info, Sparkles } from 'lucide-react'
import { repositories } from '../data/mockData'
import { PageHeader, SelectField } from '../components'

export default function AnalyzePage({ onAnalyze, isAnalyzing = false }) {
  const [repo, setRepo] = useState(repositories[0].name)
  const [branch, setBranch] = useState(repositories[0].branch)
  const [change, setChange] = useState(
    'Replace the existing email/password authentication flow with OAuth 2.0 authentication.'
  )
  const [pr, setPr] = useState('')
  const [context, setContext] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!change.trim()) {
      setError('Describe the proposed change before continuing.')
      return
    }
    setError('')
    onAnalyze({ repository: repo, branch, changeDescription: change, pr, context })
  }

  return (
    <div className="page-content narrow-page">
      <PageHeader
        eyebrow="Impact analysis / New"
        title="Analyze a proposed change"
        description="Give IMPACT the context it needs to map what could move with your code."
      />
      <form className="analysis-form panel" onSubmit={submit}>
        <div className="form-intro">
          <div className="form-icon">
            <Sparkles size={19} />
          </div>
          <div>
            <h2>Change context</h2>
            <p>This analysis uses repository metadata and mock results for now. IBM Bob will power this boundary next.</p>
          </div>
        </div>
        <div className="form-row">
          <SelectField
            label="Repository"
            value={repo}
            options={repositories.map((item) => item.name)}
            onChange={(value) => {
              setRepo(value)
              const matchedRepo = repositories.find((item) => item.name === value)
              if (matchedRepo) setBranch(matchedRepo.branch)
            }}
          />
          <SelectField
            label="Branch"
            value={branch}
            options={
              repositories.find((item) => item.name === repo)?.branch === branch
                ? [branch, 'feature/oauth-migration', 'staging']
                : [branch, 'main', 'develop']
            }
            onChange={setBranch}
          />
        </div>
        <label className="field">
          <span>
            Proposed change <em>Required</em>
          </span>
          <textarea
            rows="6"
            maxLength={500}
            value={change}
            onChange={(event) => {
              setChange(event.target.value)
              if (error) setError('')
            }}
            placeholder="Describe the code change you are planning..."
          />
          <small className="field-hint">
            <span>Example: Replace the existing authentication system with OAuth 2.0.</span>
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
              placeholder="e.g. PR #482 or commit SHA"
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
            placeholder="What else should the analysis know?"
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
            <Info size={15} /> Results are mocked for this prototype
          </span>
          <button className="button primary" type="submit" disabled={isAnalyzing}>
            {isAnalyzing ? 'Preparing report...' : 'Analyze change'} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
