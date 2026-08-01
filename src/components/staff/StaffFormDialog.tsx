import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateStaff, useUpdateStaff } from '@/hooks/useStaff'
import { DEPARTMENTS } from '@/lib/constants'
import type { StaffMember } from '@/types/user'

const staffSchema = z.object({
  name: z.string().min(2, 'Enter the staff member\'s full name'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  department: z.string().min(1, 'Select a department'),
  designation: z.string().min(2, 'Enter a designation'),
  joiningDate: z.string().min(1, 'Select a joining date'),
})

type StaffFormValues = z.infer<typeof staffSchema>

interface StaffFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: StaffMember | null
}

export function StaffFormDialog({ open, onOpenChange, staff }: StaffFormDialogProps) {
  const isEditing = Boolean(staff)
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff(staff?.id ?? '')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({ resolver: zodResolver(staffSchema) })

  useEffect(() => {
    if (open) {
      reset(
        staff
          ? {
              name: staff.name,
              email: staff.email,
              phone: staff.phone,
              department: staff.department,
              designation: staff.designation,
              joiningDate: staff.joiningDate?.slice(0, 10) ?? '',
            }
          : { name: '', email: '', phone: '', department: '', designation: '', joiningDate: '' },
      )
    }
  }, [open, staff, reset])

  const onSubmit = async (values: StaffFormValues) => {
    try {
      if (isEditing && staff) {
        await updateStaff.mutateAsync(values)
        toast.success('Staff member updated')
      } else {
        await createStaff.mutateAsync(values)
        toast.success('Staff member added', { description: 'An invite email has been sent to set their password.' })
      }
      onOpenChange(false)
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error(isEditing ? 'Could not update staff member' : 'Could not add staff member', {
        description: apiError.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update details for this staff member.' : 'They\u2019ll receive an email to set up their account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="e.g. Arun Kumar" {...register('name')} />
            {errors.name && <p className="mt-1.5 text-xs font-medium text-danger">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@company.com" {...register('email')} />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+91 98765 43210" {...register('phone')} />
              {errors.phone && <p className="mt-1.5 text-xs font-medium text-danger">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="department">Department</Label>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className="mt-1.5 text-xs font-medium text-danger">{errors.department.message}</p>}
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" placeholder="e.g. Sales Executive" {...register('designation')} />
              {errors.designation && <p className="mt-1.5 text-xs font-medium text-danger">{errors.designation.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="joiningDate">Joining Date</Label>
            <Input id="joiningDate" type="date" {...register('joiningDate')} />
            {errors.joiningDate && <p className="mt-1.5 text-xs font-medium text-danger">{errors.joiningDate.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
