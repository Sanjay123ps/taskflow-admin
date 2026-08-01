import type { TaskPriority, TaskStatus } from '@/types/task'
import type { AttendanceStatus } from '@/types/attendance'

export const APP_NAME = 'TaskFlow'

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  LATE: 'Late',
  HALF_DAY: 'Half Day',
  INCOMPLETE: 'Incomplete',
  ABSENT: 'Absent',
}

export const DEPARTMENTS = [
  'Operations',
  'Sales',
  'Marketing',
  'Warehouse',
  'Finance',
  'Customer Support',
  'IT',
] as const
