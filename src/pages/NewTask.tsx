import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Paperclip, X, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeCombobox } from '@/components/common/EmployeeCombobox'
import { useStaffMember } from '@/hooks/useStaff'
import { useCreateTask } from '@/hooks/useTasks'
import { PRIORITY_LABELS } from '@/lib/constants'
import type { StaffMember } from '@/types/user'

const taskSchema = z.object({
  assignedToId: z.string().min(1, 'Please select a valid Staff member.'),
  title: z.string().min(3, 'Give the task a clear title'),
  description: z.string().min(5, 'Add a short description of the task'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().min(1, 'Select a due date'),
  dueTime: z.string().min(1, 'Select a due time'),
  notes: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

export default function NewTask() {
  const location = useLocation()
  const navigate = useNavigate()
  const prefilledStaffId = (location.state as { staffId?: string } | null)?.staffId
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachment, setAttachment] = useState<File | null>(null)

  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const { data: prefilledStaffData } = useStaffMember(prefilledStaffId ?? null)
  const createTask = useCreateTask()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { assignedToId: prefilledStaffId ?? '', priority: 'MEDIUM', title: '', description: '', dueDate: '', dueTime: '', notes: '' },
  })

  useEffect(() => {
    if (prefilledStaffId) reset((prev) => ({ ...prev, assignedToId: prefilledStaffId }))
  }, [prefilledStaffId, reset])

  useEffect(() => {
    if (prefilledStaffData) setSelectedStaff(prefilledStaffData)
  }, [prefilledStaffData])

  const onSubmit = async (values: TaskFormValues) => {
    try {
      await createTask.mutateAsync({ ...values, attachment })
      toast.success('Task created', { description: `Assigned to ${selectedStaff?.name ?? 'staff member'}.` })
      reset({ assignedToId: '', priority: 'MEDIUM', title: '', description: '', dueDate: '', dueTime: '', notes: '' })
      setSelectedStaff(null)
      setAttachment(null)
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not create task', { description: apiError.message })
    }
  }

  const handleReset = () => {
    reset({ assignedToId: '', priority: 'MEDIUM', title: '', description: '', dueDate: '', dueTime: '', notes: '' })
    setSelectedStaff(null)
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium text-ink-400">Dashboard / New Task</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">New Task</h1>
        <p className="mt-1 text-sm text-ink-500">Assign a task to a staff member with a due date and priority.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="assignedToId">Employee / Staff</Label>
                <Controller
                  control={control}
                  name="assignedToId"
                  render={({ field }) => (
                    <EmployeeCombobox
                      id="assignedToId"
                      value={field.value}
                      onChange={(staffId, staff) => {
                        field.onChange(staffId)
                        setSelectedStaff(staff)
                      }}
                      hasError={Boolean(errors.assignedToId)}
                    />
                  )}
                />
                {errors.assignedToId && <p className="mt-1.5 text-xs font-medium text-danger">{errors.assignedToId.message}</p>}
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" value={selectedStaff?.employeeId ?? ''} placeholder="Auto-filled" disabled readOnly />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" placeholder="Enter task title" {...register('title')} />
              {errors.title && <p className="mt-1.5 text-xs font-medium text-danger">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Task Description</Label>
              <Textarea id="description" rows={4} placeholder="Enter task description" {...register('description')} />
              {errors.description && <p className="mt-1.5 text-xs font-medium text-danger">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...register('dueDate')} />
                {errors.dueDate && <p className="mt-1.5 text-xs font-medium text-danger">{errors.dueDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="dueTime">Due Time</Label>
                <Input id="dueTime" type="time" {...register('dueTime')} />
                {errors.dueTime && <p className="mt-1.5 text-xs font-medium text-danger">{errors.dueTime.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" rows={2} placeholder="Any additional notes" {...register('notes')} />
            </div>

            <div>
              <Label>Attachment (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              />
              {attachment ? (
                <div className="flex items-center justify-between rounded-[var(--radius-control)] border border-ink-200 bg-ink-50 px-3.5 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-ink-700">
                    <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                    <span className="truncate">{attachment.name}</span>
                  </span>
                  <button type="button" onClick={() => setAttachment(null)} className="text-ink-400 hover:text-danger">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-full items-center gap-2 rounded-[var(--radius-control)] border border-dashed border-ink-300 px-3.5 text-sm text-ink-400 transition-colors hover:border-brand-400 hover:text-brand-600"
                >
                  <Paperclip className="h-4 w-4" /> Choose file — no file chosen
                </button>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => { handleReset(); }}>
                Reset
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}