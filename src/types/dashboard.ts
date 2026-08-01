import type { ActivityLogEntry } from './activity'
import type { StaffMember } from './user'

export interface DashboardKpis {
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  completionRate: number
  totalTasksTrend?: number
  pendingTasksTrend?: number
  completedTasksTrend?: number
  completionRateTrend?: number
}

export interface TaskAnalyticsPoint {
  label: string
  created: number
  completed: number
  pending: number
  overdue: number
}

export type AnalyticsRange = 'today' | 'week' | 'month' | 'custom'

export interface DashboardSummary {
  kpis: DashboardKpis
  staffProgress: StaffMember[]
  recentActivity: ActivityLogEntry[]
  analytics: TaskAnalyticsPoint[]
  taskCounters: {
    created: number
    completed: number
    pending: number
    overdue: number
  }
}
