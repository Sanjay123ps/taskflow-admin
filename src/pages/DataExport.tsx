import { useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList, Users, History, CalendarClock, FileSpreadsheet, FileText, FileDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStaffList } from '@/hooks/useStaff'
import { downloadReport, triggerBlobDownload, type ReportType } from '@/api/reports'
import { PRIORITY_LABELS, STATUS_LABELS, ATTENDANCE_STATUS_LABELS, DEPARTMENTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const REPORT_TYPES: Array<{ value: ReportType; label: string; description: string; icon: typeof ClipboardList }> = [
  { value: 'tasks', label: 'Task Report', description: 'Export all tasks data', icon: ClipboardList },
  { value: 'staff', label: 'Staff Report', description: 'Export staff details', icon: Users },
  { value: 'activity', label: 'Activity Log', description: 'Export activity log', icon: History },
  { value: 'attendance', label: 'Attendance Reports', description: 'Export attendance records', icon: CalendarClock },
]

const FORMATS: Array<{ value: 'xlsx' | 'csv'; label: string; sub: string; icon: typeof FileSpreadsheet }> = [
  { value: 'xlsx', label: 'Excel (.xlsx)', sub: 'Best for spreadsheets', icon: FileSpreadsheet },
  { value: 'csv', label: 'CSV (.csv)', sub: 'Universal format', icon: FileText },
]

export default function DataExport() {
  const [reportType, setReportType] = useState<ReportType>('tasks')
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [staffId, setStaffId] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [department, setDepartment] = useState('ALL')
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  const { data: staffData } = useStaffList({ status: 'ACTIVE', pageSize: 200 })

  const handleReset = () => {
    setDateFrom('')
    setDateTo('')
    setStaffId('ALL')
    setStatus('ALL')
    setPriority('ALL')
    setDepartment('ALL')
    setSearch('')
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await downloadReport(reportType, {
        staffId: (reportType === 'tasks' || reportType === 'attendance') && staffId !== 'ALL' ? staffId : undefined,
        status: (reportType === 'tasks' || reportType === 'attendance') && status !== 'ALL' ? status : undefined,
        priority: reportType === 'tasks' && priority !== 'ALL' ? priority : undefined,
        department: reportType === 'attendance' && department !== 'ALL' ? department : undefined,
        search: reportType === 'attendance' ? search || undefined : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        format,
      })
      triggerBlobDownload(blob, `${reportType}-report-${new Date().toISOString().slice(0, 10)}.${format}`)
      toast.success('Export ready', { description: 'Your file has started downloading.' })
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Export failed', { description: apiError.message })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium text-ink-400">Dashboard / Data Export</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">Data Export</h1>
        <p className="mt-1 text-sm text-ink-500">Export reports for tasks, staff, activity history, or attendance.</p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div>
            <Label>Export Type</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {REPORT_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setReportType(option.value)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-[var(--radius-control)] border p-4 text-left transition-all',
                    reportType === option.value
                      ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_3px_var(--color-brand-100)]'
                      : 'border-ink-200 hover:border-brand-300',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl',
                      reportType === option.value ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-500',
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink-900">{option.label}</span>
                    <span className="block text-xs text-ink-400">{option.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Filters</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-[11px] font-normal text-ink-400">Date Range</Label>
                <div className="flex items-center gap-2">
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" />
                  <span className="text-ink-300">–</span>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" />
                </div>
              </div>
              {reportType === 'tasks' && (
                <>
                  <div>
                    <Label className="text-[11px] font-normal text-ink-400">Staff</Label>
                    <Select value={staffId} onValueChange={setStaffId}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Staff</SelectItem>
                        {staffData?.items.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-normal text-ink-400">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-normal text-ink-400">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
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
                </>
              )}
              {reportType === 'attendance' && (
                <>
                  <div>
                    <Label className="text-[11px] font-normal text-ink-400">Staff</Label>
                    <Select value={staffId} onValueChange={setStaffId}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Staff</SelectItem>
                        {staffData?.items.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-normal text-ink-400">Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Departments</SelectItem>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-normal text-ink-400">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-normal text-ink-400">Staff Name / Employee ID</Label>
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <Label>Select Format</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FORMATS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormat(option.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-[var(--radius-control)] border p-3.5 text-left transition-all',
                    format === option.value
                      ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_3px_var(--color-brand-100)]'
                      : 'border-ink-200 hover:border-brand-300',
                  )}
                >
                  <option.icon className={cn('h-5 w-5', format === option.value ? 'text-brand-700' : 'text-ink-400')} />
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{option.label}</span>
                    <span className="block text-xs text-ink-400">{option.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              <FileDown className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
