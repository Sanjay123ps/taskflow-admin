import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, Filter, History } from 'lucide-react'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useStaffList } from '@/hooks/useStaff'
import { downloadReport, triggerBlobDownload } from '@/api/reports'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/common/Pagination'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { ActivityAction } from '@/types/activity'

const ACTION_OPTIONS: Array<{ value: ActivityAction | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Activities' },
  { value: 'ADMIN_LOGIN', label: 'Admin Login' },
  { value: 'STAFF_LOGIN', label: 'Staff Login' },
  { value: 'STAFF_CREATED', label: 'Staff Created' },
  { value: 'STAFF_UPDATED', label: 'Staff Updated' },
  { value: 'STAFF_DEACTIVATED', label: 'Staff Deactivated' },
  { value: 'TASK_CREATED', label: 'Task Created' },
  { value: 'TASK_UPDATED', label: 'Task Updated' },
  { value: 'TASK_COMPLETED', label: 'Task Completed' },
  { value: 'TASK_DELETED', label: 'Task Deleted' },
  { value: 'SIGNUP_REQUEST_SUBMITTED', label: 'Signup Requested' },
  { value: 'SIGNUP_REQUEST_APPROVED', label: 'Signup Approved' },
  { value: 'SIGNUP_REQUEST_REJECTED', label: 'Signup Rejected' },
]

export default function ActivityLog() {
  const [action, setAction] = useState<ActivityAction | 'ALL'>('ALL')
  const [userId, setUserId] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  const { data: staffData } = useStaffList({ pageSize: 200 })

  useEffect(() => {
    setPage(1)
  }, [action, userId, dateFrom, dateTo])

  const queryParams = useMemo(
    () => ({
      action: action !== 'ALL' ? action : undefined,
      userId: userId !== 'ALL' ? userId : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      pageSize: 10,
    }),
    [action, userId, dateFrom, dateTo, page],
  )

  const { data, isLoading, isError, error, refetch } = useActivityLog(queryParams)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await downloadReport('activity', {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        format: 'xlsx',
      })
      triggerBlobDownload(blob, `activity-log-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Export ready')
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Export failed', { description: apiError.message })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400">Dashboard / Activity Log</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">Activity Log</h1>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export'}
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-ink-100 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label className="lg:hidden">Activity</Label>
            <Select value={action} onValueChange={(v) => setAction(v as ActivityAction | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="All Activities" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="lg:hidden">Staff</Label>
            <Select value={userId} onValueChange={setUserId}>
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
          <div className="lg:col-span-2">
            <Label className="lg:hidden">Date Range</Label>
            <div className="flex items-center gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" />
              <span className="text-ink-300">–</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" />
            </div>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={History} title="No activity found" description="Try adjusting your filters." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.createdAt, true)}</TableCell>
                    <TableCell className="font-semibold text-ink-900">{entry.userName}</TableCell>
                    <TableCell>
                      <Badge variant={entry.userRole === 'ADMIN' ? 'violet' : 'brand'}>
                        {entry.action.replaceAll('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-ink-500">{entry.description}</TableCell>
                    <TableCell className="text-ink-400">{entry.ipAddress ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} totalPages={data.totalPages} totalItems={data.total} pageSize={data.pageSize} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
