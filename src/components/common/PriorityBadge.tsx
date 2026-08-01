import { Badge } from '@/components/ui/badge'
import { PRIORITY_LABELS } from '@/lib/constants'
import type { TaskPriority } from '@/types/task'

const VARIANTS: Record<TaskPriority, 'neutral' | 'brand' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'brand',
  HIGH: 'warning',
  URGENT: 'danger',
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge variant={VARIANTS[priority]}>{PRIORITY_LABELS[priority]}</Badge>
}
