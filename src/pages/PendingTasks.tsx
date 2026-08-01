import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { MoreVertical, Pencil, CheckCircle2, Trash2, ClipboardList, Download } from 'lucide-react'
import { useTaskList, useCompleteTask, useDeleteTask } from '@/hooks/useTasks'
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
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TaskFilterBar } from '@/components/tasks/TaskFilterBar'
import { TaskEditDialog } from '@/components/tasks/TaskEditDialog'
import { formatDate, initials } from '@/lib/utils'
import type { Task, TaskPriority, TaskStatus } from '@/types/task'

const STATUS_OPTIONS: Array<{ value: TaskStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'OVERDUE', label: 'Overdue' },
]

export default function PendingTasks() {
  const location = useLocation()
  const [staffId, setStaffId] = useState('ALL')
  const [priority, setPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [status, setStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const prefillStaffId = (location.state as { staffId?: string } | null)?.staffId
    if (prefillStaffId) setStaffId(prefillStaffId)
  }, [location.state])

  useEffect(() => {
    setPage(1)
  }, [staffId, priority, status, dateFrom, dateTo])

  const { data: staffData } = useStaffList({ status: 'ACTIVE', pageSize: 200 })
  const completeTask = useCompleteTask()
  const deleteTask = useDeleteTask()

  const queryParams = useMemo(
    () => ({
      staffId: staffId !== 'ALL' ? staffId : undefined,
      priority: priority !== 'ALL' ? priority : undefined,
      status: status !== 'ALL' ? status : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      pageSize: 8,
      excludeCompleted: true,
    }),
    [staffId, priority, status, dateFrom, dateTo, page],
  )

  const { data, isLoading, isError, error, refetch } = useTaskList(queryParams)

  const handleComplete = async (task: Task) => {
    try {
      await completeTask.mutateAsync(task.id)
      toast.success(`"${task.title}" marked complete`)
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not complete task', { description: apiError.message })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTask.mutateAsync(deleteTarget.id)
      toast.success('Task deleted')
      setDeleteTarget(null)
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not delete task', { description: apiError.message })
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await downloadReport('tasks', {
        staffId: staffId !== 'ALL' ? staffId : undefined,
        status: status !== 'ALL' ? status : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        format: 'xlsx',
      })
      triggerBlobDownload(blob, `pending-tasks-${new Date().toISOString().slice(0, 10)}.xlsx`)
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
          <p className="text-xs font-medium text-ink-400">Dashboard / Pending Tasks</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">Pending Tasks</h1>
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
          status={status}
          onStatusChange={setStatus}
          statusOptions={STATUS_OPTIONS}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No pending tasks" description="All caught up — nothing here matches your filters." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date &amp; Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="max-w-[220px]">
                      <p className="truncate font-semibold text-ink-900">{task.title}</p>
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
                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      {formatDate(task.dueDate)}, {task.dueTime}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleComplete(task)}>
                            <CheckCircle2 className="h-4 w-4" /> Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditingTask(task)}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem destructive onSelect={() => setDeleteTarget(task)}>
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} totalPages={data.totalPages} totalItems={data.total} pageSize={data.pageSize} onPageChange={setPage} />
          </>
        )}
      </Card>

      <TaskEditDialog task={editingTask} onOpenChange={(open) => !open && setEditingTask(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this task?"
        description={`"${deleteTarget?.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteTask.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
