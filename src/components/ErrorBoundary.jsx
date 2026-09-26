import { Component } from 'react'

/**
 * ErrorBoundary — catches render-phase errors and shows a recoverable screen.
 * Without this, any unhandled error during rendering produces a blank page.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('IMPACT render error:', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '1rem',
            padding: '2rem',
            background: '#0a0f1e',
            color: '#f0f4f8',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
            }}
          >
            ⚠
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Something went wrong</h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#94a3b8',
              maxWidth: 420,
              textAlign: 'center',
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 8,
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid rgba(56,189,248,0.35)',
              color: '#38bdf8',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
