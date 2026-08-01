import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { useTaskSettings, useUpdateTaskSettings } from '@/hooks/useSettings'
import { PRIORITY_LABELS } from '@/lib/constants'
import type { TaskSettings } from '@/types/settings'

export function TaskSettingsPanel() {
  const { data, isLoading, isError, error, refetch } = useTaskSettings()
  const updateSettings = useUpdateTaskSettings()

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<TaskSettings>()

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  if (isLoading) return <Skeleton className="h-48 w-full rounded-[var(--radius-card)]" />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  const onSubmit = async (values: TaskSettings) => {
    try {
      await updateSettings.mutateAsync(values)
      toast.success('Task settings saved')
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not save settings', { description: apiError.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="max-w-xs">
        <Label htmlFor="defaultPriority">Default Task Priority</Label>
        <Controller
          control={control}
          name="defaultPriority"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="defaultPriority">
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
        <p className="mt-1.5 text-xs text-ink-400">Applied automatically when creating a new task.</p>
      </div>

      <div className="flex justify-end border-t border-ink-100 pt-5">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
