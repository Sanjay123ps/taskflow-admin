import { Badge } from '@/components/ui/badge'
import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants'
import type { AttendanceStatus } from '@/types/attendance'

const VARIANTS: Record<AttendanceStatus, 'success' | 'warning' | 'brand' | 'neutral' | 'danger'> = {
  PRESENT: 'success',
  LATE: 'warning',
  HALF_DAY: 'brand',
  INCOMPLETE: 'neutral',
  ABSENT: 'danger',
}

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <Badge variant={VARIANTS[status]} dot>
      {ATTENDANCE_STATUS_LABELS[status]}
    </Badge>
  )
}
