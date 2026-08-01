import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthSplitLayout, AuthCard } from '@/components/auth/AuthSplitLayout'
import { delay } from '@/lib/authMock'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitError(null)
    try {
      // Mock only — real OTP dispatch is wired up once SMTP lands.
      await delay(900)
      navigate('/admin/forgot-password/verify-otp', { state: { email: values.email } })
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  return (
    <AuthSplitLayout
      headline="Reset Your Password"
      description="Enter your admin email address and we'll send you a 4-digit OTP to reset your password."
    >
      <AuthCard>
        <div className="mb-7 text-center">
          <h1 className="font-display text-xl font-extrabold text-ink-900">Forgot Password?</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Enter your registered admin email address and we'll send you a 4-digit OTP to reset your password.
          </p>
        </div>

        {submitError && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@company.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs font-medium text-danger">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending OTP…' : 'Send OTP'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthSplitLayout>
  )
}
