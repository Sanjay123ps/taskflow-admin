import { RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterSelect } from '@/components/common/FilterSelect'
import { ATTENDANCE_STATUS_LABELS, DEPARTMENTS } from '@/lib/constants'
import type { StaffMember } from '@/types/user'
import type { AttendanceStatus } from '@/types/attendance'

interface AttendanceFilterBarProps {
  staff: StaffMember[]
  staffId: string
  onStaffChange: (value: string) => void
  department: string
  onDepartmentChange: (value: string) => void
  status: AttendanceStatus | 'ALL'
  onStatusChange: (value: AttendanceStatus | 'ALL') => void
  search: string
  onSearchChange: (value: string) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onToday: () => void
  onReset: () => void
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  ...Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

const DEPARTMENT_OPTIONS = [
  { value: 'ALL', label: 'All Departments' },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
]

export function AttendanceFilterBar({
  staff,
  staffId,
  onStaffChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onToday,
  onReset,
}: AttendanceFilterBarProps) {
  return (
    <div className="space-y-3 border-b border-ink-100 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Label className="lg:hidden">Search</Label>
          <SearchInput value={search} onChange={onSearchChange} placeholder="Search by name or Employee ID" />
        </div>

        <div>
          <Label className="lg:hidden">Staff</Label>
          <FilterSelect
            value={staffId || 'ALL'}
            onChange={onStaffChange}
            placeholder="All Staff"
            options={[{ value: 'ALL', label: 'All Staff' }, ...staff.map((s) => ({ value: s.id, label: s.name }))]}
          />
        </div>

        <div>
          <Label className="lg:hidden">Department</Label>
          <FilterSelect
            value={department || 'ALL'}
            onChange={onDepartmentChange}
            placeholder="All Departments"
            options={DEPARTMENT_OPTIONS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label className="lg:hidden">Status</Label>
          <FilterSelect
            value={status}
            onChange={(v) => onStatusChange(v as AttendanceStatus | 'ALL')}
            placeholder="All Status"
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="lg:col-span-2">
          <Label className="lg:hidden">Date Range</Label>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} aria-label="From date" />
            <span className="text-ink-300">–</span>
            <Input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} aria-label="To date" />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button variant="secondary" className="flex-1" onClick={onToday}>
            Today
          </Button>
          <Button variant="ghost" onClick={onReset} aria-label="Reset filters">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
