import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { ProfilePhotoUpload } from '@/components/settings/ProfilePhotoUpload'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateAccountSettings } from '@/hooks/useSettings'
import { changePassword } from '@/api/auth'
import { uploadProfilePhoto, removeProfilePhoto } from '@/api/profile'

const accountSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type AccountFormValues = z.infer<typeof accountSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export function AccountSettingsPanel() {
  const { admin, updateAdminProfile } = useAuth()
  const updateAccount = useUpdateAccountSettings()
  const [changingPassword, setChangingPassword] = useState(false)

  const accountForm = useForm<AccountFormValues>({ resolver: zodResolver(accountSchema) })
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (admin) accountForm.reset({ name: admin.name, email: admin.email })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  const onSaveAccount = async (values: AccountFormValues) => {
    try {
      await updateAccount.mutateAsync({ ...values, profileImage: admin?.profileImage ?? null })
      toast.success('Account details updated')
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not update account', { description: apiError.message })
    }
  }

  const onChangePassword = async (values: PasswordFormValues) => {
    setChangingPassword(true)
    try {
      await changePassword(values)
      toast.success('Password changed')
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not change password', { description: apiError.message })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={accountForm.handleSubmit(onSaveAccount)} className="space-y-5">
        <ProfilePhotoUpload
          name={admin?.name ?? 'Admin'}
          imageUrl={admin?.profileImage ?? null}
          onUpload={uploadProfilePhoto}
          onRemove={removeProfilePhoto}
          onChange={(result) => updateAdminProfile({ profileImage: result.profileImage })}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="accountName">Full Name</Label>
            <Input id="accountName" {...accountForm.register('name')} />
            {accountForm.formState.errors.name && (
              <p className="mt-1.5 text-xs font-medium text-danger">{accountForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="accountEmail">Email</Label>
            <Input id="accountEmail" type="email" {...accountForm.register('email')} />
            {accountForm.formState.errors.email && (
              <p className="mt-1.5 text-xs font-medium text-danger">{accountForm.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-ink-100 pt-5">
          <Button type="submit" disabled={accountForm.formState.isSubmitting}>
            {accountForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <div>
        <p className="mb-4 text-sm font-bold text-ink-900">Change Password</p>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <div>
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              autoComplete="current-password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <PasswordInput
                id="newPassword"
                label="New Password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
            </div>
            <div>
              <PasswordInput
                id="confirmPassword"
                label="Confirm New Password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
            </div>
          </div>
          <div className="flex justify-end border-t border-ink-100 pt-5">
            <Button type="submit" variant="secondary" disabled={changingPassword}>
              {changingPassword ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
