import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Mail, User, Lock } from 'lucide-react'
import type HCaptcha from '@hcaptcha/react-hcaptcha'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/forms/PasswordInput'
import Captcha from '@/components/ui/Captcha'
import { AuthSplitLayout, AuthCard } from '@/components/auth/AuthSplitLayout'
import { passwordSchema } from '@/lib/password'
import { submitAdminSignupRequest } from '@/api/signup'

const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function AdminSignup() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError(null)
    // Only enforced when the widget actually rendered (VITE_HCAPTCHA_SITE_KEY
    // set) — mirrors the backend, which skips verification entirely when
    // CAPTCHA_SECRET_KEY isn't configured (local dev).
    if (captchaRef.current && !captchaToken) {
      setCaptchaError('Please complete the CAPTCHA challenge.')
      return
    }
    setCaptchaError(null)
    try {
      await submitAdminSignupRequest({ ...values, captchaToken: captchaToken ?? undefined })
      navigate('/admin/signup/verify-otp', { state: { email: values.email } })
    } catch (err) {
      const apiError = err as { message?: string }
      setSubmitError(apiError.message ?? 'Something went wrong. Please try again.')
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    }
  }

  return (
    <AuthSplitLayout
      headline="Manage everything. Achieve more."
      description="TaskFlow helps you and your team plan, track and complete tasks efficiently."
    >
      <AuthCard>
        <div className="mb-7 text-center">
          <h1 className="font-display text-xl font-extrabold text-ink-900">Create Admin Account</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign up to get started with TaskFlow Admin Portal</p>
        </div>

        {submitError && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Jordan Blake"
                className="pl-10"
                {...register('fullName')}
              />
            </div>
            {errors.fullName && <p className="mt-1.5 text-xs font-medium text-danger">{errors.fullName.message}</p>}
          </div>

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

          <PasswordInput
            id="password"
            label="Password"
            leadingIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            leadingIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Captcha
            ref={captchaRef}
            onVerify={(token) => {
              setCaptchaToken(token)
              setCaptchaError(null)
            }}
            onExpire={() => setCaptchaToken(null)}
            error={captchaError ?? undefined}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Admin Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthSplitLayout>
  )
}
