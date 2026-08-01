import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/constants'
import type { TaskStatus } from '@/types/task'

const VARIANTS: Record<TaskStatus, 'warning' | 'brand' | 'success' | 'danger'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'brand',
  COMPLETED: 'success',
  OVERDUE: 'danger',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={VARIANTS[status]} dot>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
