import { RefreshCw, WifiOff, ShieldAlert, ServerCrash, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ApiRequestError } from '@/api/client'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const apiError = error as Partial<ApiRequestError> | undefined
  const kind = apiError?.kind ?? 'unknown'

  const Icon = kind === 'network' ? WifiOff : kind === 'forbidden' || kind === 'unauthorized' ? ShieldAlert : kind === 'server' ? ServerCrash : AlertTriangle

  const message = apiError?.message ?? 'Something went wrong while loading this data.'

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink-900">Couldn't load this</p>
        <p className="max-w-sm text-sm text-ink-500">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  )
}
