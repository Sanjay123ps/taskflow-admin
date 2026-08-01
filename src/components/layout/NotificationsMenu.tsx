import { Bell, UserPlus, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSignupRequests } from '@/hooks/useSignupRequests'
import { useDashboardSummary } from '@/hooks/useDashboard'

export function NotificationsMenu() {
  const navigate = useNavigate()
  const { data: signupData } = useSignupRequests({ status: 'PENDING', pageSize: 5 })
  const { data: dashboard } = useDashboardSummary('week')

  const pendingSignups = signupData?.items ?? []
  const overdueCount = dashboard?.taskCounters.overdue ?? 0
  const count = pendingSignups.length + (overdueCount > 0 ? 1 : 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {overdueCount > 0 && (
          <DropdownMenuItem onSelect={() => navigate('/tasks/pending')}>
            <AlertTriangle className="h-4 w-4 text-danger" />
            <span>
              <span className="font-semibold">{overdueCount}</span> task{overdueCount === 1 ? ' is' : 's are'} overdue
            </span>
          </DropdownMenuItem>
        )}
        {pendingSignups.map((request) => (
          <DropdownMenuItem key={request.id} onSelect={() => navigate('/staff')}>
            <UserPlus className="h-4 w-4 text-brand-600" />
            <span className="truncate">
              <span className="font-semibold">{request.name}</span> requested Staff access
            </span>
          </DropdownMenuItem>
        ))}
        {count === 0 && <p className="px-2.5 py-4 text-center text-sm text-ink-400">You're all caught up.</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
