import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render-time exceptions anywhere below it in the tree. Without
 * this, an unhandled error in a single page (e.g. a bad API response shape)
 * unmounts the entire app instead of degrading to just that page. Class
 * component because error boundaries have no hook equivalent yet.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error in route tree:', error, info.componentStack)
  }

  private handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Something went wrong</h1>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              This page hit an unexpected error. Reloading usually fixes it.
            </p>
          </div>
          <Button onClick={this.handleReload}>
            <RefreshCw className="h-3.5 w-3.5" />
            Reload page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
