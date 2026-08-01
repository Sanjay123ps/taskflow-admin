import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Users, UserCheck, Clock, UserX, AlertTriangle, CalendarClock, FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import { useAttendanceList, useAttendanceSummary } from '@/hooks/useAttendance'
import { useStaffList } from '@/hooks/useStaff'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { downloadReport, triggerBlobDownload } from '@/api/reports'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/common/Pagination'
import { AttendanceStatusBadge } from '@/components/common/AttendanceStatusBadge'
import { AttendanceFilterBar } from '@/components/attendance/AttendanceFilterBar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { formatClockTime, formatDate, formatWorkingMinutes, initials } from '@/lib/utils'
import type { AttendanceStatus } from '@/types/attendance'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Attendance() {
  const [search, setSearch] = useState('')
  const [staffId, setStaffId] = useState('ALL')
  const [department, setDepartment] = useState('ALL')
  const [status, setStatus] = useState<AttendanceStatus | 'ALL'>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, staffId, department, status, dateFrom, dateTo])

  const { data: staffData } = useStaffList({ status: 'ACTIVE', pageSize: 200 })
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary()

  const queryParams = useMemo(() => {
    // A single exact day (from === to) is sent as `date` so the backend
    // can also resolve ABSENT staff for that day; a real range is sent
    // as dateFrom/dateTo.
    const isExactDay = Boolean(dateFrom) && dateFrom === dateTo
    return {
      search: debouncedSearch || undefined,
      staffId: staffId !== 'ALL' ? staffId : undefined,
      department: department !== 'ALL' ? department : undefined,
      status: status !== 'ALL' ? status : undefined,
      date: isExactDay ? dateFrom : undefined,
      dateFrom: !isExactDay ? dateFrom || undefined : undefined,
      dateTo: !isExactDay ? dateTo || undefined : undefined,
      page,
      pageSize: 10,
    }
  }, [debouncedSearch, staffId, department, status, dateFrom, dateTo, page])

  const { data, isLoading, isError, error, refetch } = useAttendanceList(queryParams)

  const handleExport = async (exportFormat: 'xlsx' | 'csv') => {
    setExporting(true)
    try {
      const { page: _page, pageSize: _pageSize, ...filters } = queryParams
      const blob = await downloadReport('attendance', { ...filters, format: exportFormat })
      const suffix = filters.date ?? (filters.dateFrom && filters.dateTo ? `${filters.dateFrom}_to_${filters.dateTo}` : 'all')
      triggerBlobDownload(blob, `Attendance_Report_${suffix}.${exportFormat}`)
      toast.success('Export ready', { description: 'Your file has started downloading.' })
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Unable to export attendance data. Please try again.', { description: apiError.message })
    } finally {
      setExporting(false)
    }
  }

  const handleToday = () => {
    const today = todayISO()
    setDateFrom(today)
    setDateTo(today)
  }

  const handleReset = () => {
    setSearch('')
    setStaffId('ALL')
    setDepartment('ALL')
    setStatus('ALL')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400">Dashboard / Attendance</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">Attendance</h1>
          <p className="mt-1 text-sm text-ink-500">Staff login and logout activity, tracked automatically.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={exporting} className="shrink-0">
              <FileDown className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleExport('xlsx')}>
              <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport('csv')}>
              <FileText className="h-4 w-4" /> CSV (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard icon={Users} label="Total Staff" value={summaryLoading ? '—' : String(summary?.totalStaff ?? 0)} tone="brand" />
        <KpiCard
          icon={UserCheck}
          label="Present Today"
          value={summaryLoading ? '—' : String(summary?.presentToday ?? 0)}
          tone="success"
        />
        <KpiCard icon={Clock} label="Late Today" value={summaryLoading ? '—' : String(summary?.lateToday ?? 0)} tone="warning" />
        <KpiCard
          icon={UserX}
          label="Absent Today"
          value={summaryLoading ? '—' : String(summary?.absentToday ?? 0)}
          tone="danger"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Incomplete"
          value={summaryLoading ? '—' : String(summary?.incompleteToday ?? 0)}
          tone="violet"
        />
      </div>

      <Card>
        <AttendanceFilterBar
          staff={staffData?.items ?? []}
          staffId={staffId}
          onStaffChange={setStaffId}
          department={department}
          onDepartmentChange={setDepartment}
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onToday={handleToday}
          onReset={handleReset}
        />

        {isLoading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No attendance records"
            description="Nothing here matches your filters yet."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Logout</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">{initials(record.staffName)}</AvatarFallback>
                        </Avatar>
                        {record.staffName}
                      </div>
                    </TableCell>
                    <TableCell>{record.employeeId || '—'}</TableCell>
                    <TableCell>{record.department || '—'}</TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{formatClockTime(record.loginTime)}</TableCell>
                    <TableCell>{formatClockTime(record.logoutTime)}</TableCell>
                    <TableCell>{formatWorkingMinutes(record.totalWorkingMinutes)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={record.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  )
}
