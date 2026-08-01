import { useNavigate } from 'react-router-dom'
import {
  History,
  LogIn,
  LogOut,
  UserPlus,
  UserCog,
  UserX,
  ListPlus,
  ClipboardCheck,
  ClipboardEdit,
  Trash2,
  Inbox,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { formatDate } from '@/lib/utils'
import type { ActivityAction, ActivityLogEntry } from '@/types/activity'

const ACTION_ICON: Record<ActivityAction, LucideIcon> = {
  ADMIN_LOGIN: LogIn,
  ADMIN_LOGOUT: LogOut,
  STAFF_LOGIN: LogIn,
  STAFF_LOGOUT: LogOut,
  STAFF_CREATED: UserPlus,
  STAFF_UPDATED: UserCog,
  STAFF_DEACTIVATED: UserX,
  TASK_CREATED: ListPlus,
  TASK_ASSIGNED: ListPlus,
  TASK_UPDATED: ClipboardEdit,
  TASK_COMPLETED: ClipboardCheck,
  TASK_DELETED: Trash2,
  SIGNUP_REQUEST_SUBMITTED: Inbox,
  SIGNUP_REQUEST_APPROVED: UserPlus,
  SIGNUP_REQUEST_REJECTED: UserX,
}

interface RecentActivityProps {
  activity: ActivityLogEntry[]
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry: () => void
}

export function RecentActivity({ activity, isLoading, isError, error, onRetry }: RecentActivityProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="link" size="sm" onClick={() => navigate('/activity')}>
          View All
        </Button>
      </CardHeader>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : activity.length === 0 ? (
          <EmptyState icon={History} title="No activity yet." description="Actions across the portal will show up here." />
        ) : (
          <ul className="space-y-1">
            {activity.map((entry) => {
              const Icon = ACTION_ICON[entry.action] ?? History
              return (
                <li key={entry.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-ink-50">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-900">
                      <span className="font-semibold">{entry.userName}</span> {entry.description}
                    </p>
                    <p className="text-xs text-ink-400">{formatDate(entry.createdAt, true)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
