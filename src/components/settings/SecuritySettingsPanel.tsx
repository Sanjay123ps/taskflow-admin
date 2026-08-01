import { toast } from 'sonner'
import { Monitor, Smartphone, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useActiveSessions, useLogoutAllSessions } from '@/hooks/useSettings'
import { formatDate } from '@/lib/utils'

export function SecuritySettingsPanel() {
  const { data, isLoading, isError, error, refetch } = useActiveSessions()
  const logoutAll = useLogoutAllSessions()

  const handleLogoutAll = async () => {
    try {
      await logoutAll.mutateAsync()
      toast.success('Logged out of all other sessions')
      refetch()
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not log out other sessions', { description: apiError.message })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink-900">Active Sessions</p>
        <Button variant="outlineDanger" size="sm" onClick={handleLogoutAll} disabled={logoutAll.isPending}>
          <ShieldAlert className="h-3.5 w-3.5" /> Log Out Other Sessions
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No active sessions found" />
      ) : (
        <div className="space-y-2">
          {data.map((session) => (
            <div key={session.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                {session.device.toLowerCase().includes('mobile') ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{session.device}</p>
                <p className="text-xs text-ink-400">{session.ipAddress} · Last active {formatDate(session.lastActiveAt, true)}</p>
              </div>
              {session.current && <Badge variant="success">This device</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
