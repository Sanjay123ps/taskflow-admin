import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { PasswordRequirements } from '@/components/forms/PasswordRequirements'
import { AuthSplitLayout, AuthCard } from '@/components/auth/AuthSplitLayout'
import { passwordSchema } from '@/lib/password'
import { delay } from '@/lib/authMock'

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export default function CreateNewPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password')

  // Only reachable after verifying the reset OTP — otherwise send them back
  // to start the reset flow properly.
  if (!email) {
    return <Navigate to="/admin/forgot-password" replace />
  }

  const onSubmit = async () => {
    setSubmitError(null)
    try {
      // Mock only — real password reset is wired up once the backend lands.
      await delay(900)
      navigate('/admin/password-changed', { replace: true })
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  return (
    <AuthSplitLayout headline="Set New Password" description="Create a new strong password for your admin account.">
      <AuthCard>
        <div className="mb-7 text-center">
          <h1 className="font-display text-xl font-extrabold text-ink-900">Create New Password</h1>
          <p className="mt-1.5 text-sm text-ink-500">Create a new strong password for your admin account.</p>
        </div>

        {submitError && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <PasswordInput
            id="password"
            label="New Password"
            leadingIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            placeholder="Enter new password"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            leadingIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            placeholder="Re-enter new password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <PasswordRequirements password={passwordValue ?? ''} />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting…' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-5 text-center">
          <Button variant="link" asChild>
            <Link to="/admin/forgot-password/verify-otp" state={{ email }}>
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to OTP Verification
            </Link>
          </Button>
        </div>
      </AuthCard>
    </AuthSplitLayout>
  )
}
