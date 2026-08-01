import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, CheckCircle2 } from 'lucide-react'
import { useTaskList } from '@/hooks/useTasks'
import { useStaffList } from '@/hooks/useStaff'
import { downloadReport, triggerBlobDownload } from '@/api/reports'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { TaskFilterBar } from '@/components/tasks/TaskFilterBar'
import { formatDate, formatDuration, initials } from '@/lib/utils'
import type { TaskPriority } from '@/types/task'

export default function CompletedTasks() {
  const [staffId, setStaffId] = useState('ALL')
  const [priority, setPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [staffId, priority, dateFrom, dateTo])

  const { data: staffData } = useStaffList({ status: 'ACTIVE', pageSize: 200 })

  const queryParams = useMemo(
    () => ({
      staffId: staffId !== 'ALL' ? staffId : undefined,
      priority: priority !== 'ALL' ? priority : undefined,
      status: 'COMPLETED' as const,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      pageSize: 8,
    }),
    [staffId, priority, dateFrom, dateTo, page],
  )

  const { data, isLoading, isError, error, refetch } = useTaskList(queryParams)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await downloadReport('tasks', {
        staffId: staffId !== 'ALL' ? staffId : undefined,
        status: 'COMPLETED',
        priority: priority !== 'ALL' ? priority : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        format: 'xlsx',
      })
      triggerBlobDownload(blob, `completed-tasks-${new Date().toISOString().slice(0, 10)}.xlsx`)
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
          <p className="text-xs font-medium text-ink-400">Dashboard / Completed Tasks</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">Completed Tasks</h1>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export'}
        </Button>
      </div>

      <Card>
        <TaskFilterBar
          staff={staffData?.items ?? []}
          staffId={staffId}
          onStaffChange={setStaffId}
          priority={priority}
          onPriorityChange={setPriority}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No completed tasks yet" description="Completed tasks will show up here." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-ink-900">{task.title}</p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={task.assignedTo?.profileImage ?? undefined} alt={task.assignedTo?.name} />
                          <AvatarFallback className="text-[10px]">
                            {task.assignedTo ? initials(task.assignedTo.name) : '—'}
                          </AvatarFallback>
                        </Avatar>
                        {task.assignedTo?.name ?? 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(task.completedAt)}</TableCell>
                    <TableCell className="tabular-nums">{formatDuration(task.createdAt, task.completedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
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
