import { Filter, Download } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PRIORITY_LABELS } from '@/lib/constants'
import type { StaffMember } from '@/types/user'
import type { TaskPriority, TaskStatus } from '@/types/task'

interface TaskFilterBarProps {
  staff: StaffMember[]
  staffId: string
  onStaffChange: (value: string) => void
  priority: TaskPriority | 'ALL'
  onPriorityChange: (value: TaskPriority | 'ALL') => void
  status?: TaskStatus | 'ALL'
  onStatusChange?: (value: TaskStatus | 'ALL') => void
  statusOptions?: Array<{ value: TaskStatus | 'ALL'; label: string }>
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onExport?: () => void
  exportLabel?: string
}

export function TaskFilterBar({
  staff,
  staffId,
  onStaffChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  statusOptions,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onExport,
  exportLabel = 'Export',
}: TaskFilterBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-ink-100 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-1">
        <Label className="lg:hidden">Staff</Label>
        <Select value={staffId} onValueChange={onStaffChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Staff</SelectItem>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="lg:col-span-1">
        <Label className="lg:hidden">Priority</Label>
        <Select value={priority} onValueChange={(v) => onPriorityChange(v as TaskPriority | 'ALL')}>
          <SelectTrigger>
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {statusOptions && onStatusChange && (
        <div className="lg:col-span-1">
          <Label className="lg:hidden">Status</Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as TaskStatus | 'ALL')}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="lg:col-span-2">
        <Label className="lg:hidden">Date Range</Label>
        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} aria-label="From date" />
          <span className="text-ink-300">–</span>
          <Input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} aria-label="To date" />
        </div>
      </div>

      <div className="flex items-end gap-2 lg:col-span-1">
        <Button variant="secondary" className="flex-1">
          <Filter className="h-4 w-4" /> Filter
        </Button>
        {onExport && (
          <Button variant="secondary" onClick={onExport} aria-label={exportLabel}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
