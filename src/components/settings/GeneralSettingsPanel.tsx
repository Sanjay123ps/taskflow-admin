import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { useGeneralSettings, useUpdateGeneralSettings } from '@/hooks/useSettings'
import type { GeneralSettings } from '@/types/settings'

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'UTC',
]

const DATE_FORMATS = ['DD MMM YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']

export function GeneralSettingsPanel() {
  const { data, isLoading, isError, error, refetch } = useGeneralSettings()
  const updateSettings = useUpdateGeneralSettings()

  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm<GeneralSettings>()

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  if (isLoading) return <Skeleton className="h-80 w-full rounded-[var(--radius-card)]" />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  const onSubmit = async (values: GeneralSettings) => {
    try {
      await updateSettings.mutateAsync(values)
      toast.success('General settings saved')
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not save settings', { description: apiError.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input id="companyName" className="pl-10" {...register('companyName')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dateFormat">Date Format</Label>
          <Controller
            control={control}
            name="dateFormat"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Controller
            control={control}
            name="timezone"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-ink-100 pt-5">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
