import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/lib/constants'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (status === 'authenticated') {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null)
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch (err) {
      const apiError = err as { message?: string }
      setSubmitError(apiError.message ?? 'Unable to sign in. Please try again.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />

      <div className="glass-panel relative w-full max-w-md rounded-[1.75rem] p-8 shadow-[var(--shadow-raised)] sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-extrabold text-ink-900">{APP_NAME} Admin Portal</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to manage staff, tasks, and reports.</p>
        </div>

        {submitError && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
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

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/admin/forgot-password" className="mb-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              leadingIcon={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{' '}
          <Link to="/admin/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Restricted to authorized administrators only
        </div>
      </div>
    </div>
  )
}
