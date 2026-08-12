import { Badge } from '@/components/ui/badge'
import type { PresenceStatus } from '@/types/user'

const PRESENCE_CONFIG: Record<PresenceStatus, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  BUSY: { label: 'Busy', variant: 'warning' },
  OFFLINE: { label: 'Offline', variant: 'neutral' },
}

/** Live Active/Busy/Offline availability — set by the staff member themselves. */
export function PresenceBadge({ status, className }: { status: PresenceStatus; className?: string }) {
  const config = PRESENCE_CONFIG[status]
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  )
}
