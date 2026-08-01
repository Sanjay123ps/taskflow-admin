import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, AlertCircle, ListChecks } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useTaskList } from '@/hooks/useTasks'
import { formatDate, initials, safePercent } from '@/lib/utils'
import type { StaffMember } from '@/types/user'

interface StaffDetailModalProps {
  staff: StaffMember | null
  onOpenChange: (open: boolean) => void
}

export function StaffDetailModal({ staff, onOpenChange }: StaffDetailModalProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const open = Boolean(staff)

  const { data: recentTasks, isLoading } = useTaskList(
    staff ? { staffId: staff.id, pageSize: 5 } : undefined,
  )

  if (!staff) return null

  const stats = staff.taskStats ?? {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
  }
  const completionRate = stats.total ? safePercent(stats.completed, stats.total) : 0

  const body = (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-4 ring-brand-50">
          <AvatarImage src={staff.profileImage ?? undefined} alt={staff.name} />
          <AvatarFallback className="text-base">{initials(staff.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-ink-900">{staff.name}</p>
          <p className="text-sm text-ink-500">{staff.employeeId} · {staff.designation}</p>
          <Badge variant={staff.status === 'ACTIVE' ? 'success' : 'neutral'} dot className="mt-1.5">
            {staff.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBlock icon={ListChecks} label="Total" value={stats.total} tone="brand" />
        <StatBlock icon={CheckCircle2} label="Completed" value={stats.completed} tone="success" />
        <StatBlock icon={Clock} label="Pending" value={stats.pending} tone="warning" />
      </div>
      {stats.overdue > 0 && (
        <StatBlock icon={AlertCircle} label="Overdue" value={stats.overdue} tone="danger" full />
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-700">Completion Rate</p>
          <p className="text-sm font-bold tabular-nums text-brand-700">{completionRate}%</p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-700 transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink-700">Recent Tasks</p>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : !recentTasks || recentTasks.items.length === 0 ? (
          <p className="rounded-xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-400">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {recentTasks.items.map((task) => (
              <div key={task.id} className="rounded-xl border border-ink-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-900">{task.title}</p>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-xs text-ink-400">Due {formatDate(task.dueDate)}</p>
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            onOpenChange(false)
            navigate('/tasks/pending', { state: { staffId: staff.id } })
          }}
        >
          View All Tasks
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            onOpenChange(false)
            navigate('/tasks/new', { state: { staffId: staff.id } })
          }}
        >
          Assign New Task
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="overflow-y-auto p-6 pt-8">
          {body}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">{body}</DialogContent>
    </Dialog>
  )
}

function StatBlock({
  icon: Icon,
  label,
  value,
  tone,
  full,
}: {
  icon: typeof CheckCircle2
  label: string
  value: number
  tone: 'brand' | 'success' | 'warning' | 'danger'
  full?: boolean
}) {
  const toneClass = {
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
  }[tone]

  return (
    <div className={`flex items-center gap-2.5 rounded-xl p-3 ${toneClass} ${full ? 'col-span-3' : ''}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <div>
        <p className="text-lg font-extrabold leading-none tabular-nums">{value}</p>
        <p className="mt-0.5 text-[11px] font-medium opacity-80">{label}</p>
      </div>
    </div>
  )
}
