import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateTask } from '@/hooks/useTasks'
import { PRIORITY_LABELS } from '@/lib/constants'
import type { Task } from '@/types/task'

const editSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().min(1, 'Due date is required'),
  dueTime: z.string().min(1, 'Due time is required'),
  notes: z.string().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

export function TaskEditDialog({ task, onOpenChange }: { task: Task | null; onOpenChange: (open: boolean) => void }) {
  const updateTask = useUpdateTask(task?.id ?? '')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate?.slice(0, 10) ?? '',
        dueTime: task.dueTime ?? '',
        notes: task.notes ?? '',
      })
    }
  }, [task, reset])

  const onSubmit = async (values: EditFormValues) => {
    try {
      await updateTask.mutateAsync(values)
      toast.success('Task updated')
      onOpenChange(false)
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not update task', { description: apiError.message })
    }
  }

  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Task Title</Label>
            <Input id="edit-title" {...register('title')} />
            {errors.title && <p className="mt-1.5 text-xs font-medium text-danger">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" rows={3} {...register('description')} />
            {errors.description && <p className="mt-1.5 text-xs font-medium text-danger">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
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
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input id="edit-dueDate" type="date" {...register('dueDate')} />
            </div>
            <div>
              <Label htmlFor="edit-dueTime">Due Time</Label>
              <Input id="edit-dueTime" type="time" {...register('dueTime')} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={2} {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
