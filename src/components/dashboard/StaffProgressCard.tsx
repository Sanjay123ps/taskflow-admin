import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CircularProgress } from './CircularProgress'
import { initials } from '@/lib/utils'
import type { StaffMember } from '@/types/user'

export function StaffProgressCard({ staff, onClick }: { staff: StaffMember; onClick: () => void }) {
  const stats = staff.taskStats ?? { total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 }

  return (
    <button
      type="button"
      onClick={onClick}
      className="scroll-snap-start flex w-[220px] shrink-0 flex-col items-center gap-3 rounded-[var(--radius-card)] border border-white/60 bg-white p-5 text-center shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <Avatar className="h-12 w-12 ring-2 ring-brand-50">
        <AvatarImage src={staff.profileImage ?? undefined} alt={staff.name} />
        <AvatarFallback>{initials(staff.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink-900">{staff.name}</p>
        <p className="text-xs text-ink-400">{staff.employeeId}</p>
      </div>

      <CircularProgress value={stats.completionRate} size={78} strokeWidth={7}>
        <span className="text-[15px] font-extrabold tabular-nums text-ink-900">
          {Math.round(stats.completionRate)}%
        </span>
      </CircularProgress>

      <div className="flex w-full items-center justify-center gap-4 text-xs">
        <div>
          <p className="font-bold tabular-nums text-ink-900">{stats.completed}</p>
          <p className="text-ink-400">Completed</p>
        </div>
        <div className="h-6 w-px bg-ink-100" />
        <div>
          <p className="font-bold tabular-nums text-ink-900">{stats.pending}</p>
          <p className="text-ink-400">Pending</p>
        </div>
      </div>
    </button>
  )
}
