import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/forms/OtpInput'
import { AuthCard } from '@/components/auth/AuthSplitLayout'
import { resendOtpMock, verifyOtpMock } from '@/lib/authMock'

const RESEND_SECONDS = 30

interface OtpVerificationCardProps {
  title: string
  description: string
  /** Already-masked email to display, e.g. "ad***@taskflow.com". */
  maskedEmail?: string
  backHref: string
  backLabel: string
  /** Called once the mock backend accepts the code — the caller decides where to navigate next. */
  onVerified: () => void
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Shared 4-digit OTP verification card: input boxes, resend countdown, and
 * verify/back actions. Used for both the signup and forgot-password flows —
 * only the copy and the `onVerified` destination differ between them.
 *
 * OTP checking is mocked (see `@/lib/authMock`): enter `1234` to simulate a
 * successful verification, or any other 4 digits to see the error state.
 */
export function OtpVerificationCard({ title, description, maskedEmail, backHref, backLabel, onVerified }: OtpVerificationCardProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const handleChange = (next: string) => {
    setCode(next)
    if (error) setError(null)
  }

  const handleVerify = async () => {
    if (code.length < 4) {
      setError('Enter all 4 digits.')
      return
    }
    setError(null)
    setIsVerifying(true)
    const ok = await verifyOtpMock(code)
    setIsVerifying(false)
    if (ok) {
      onVerified()
    } else {
      setError('Incorrect code. Please check and try again.')
      setCode('')
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    await resendOtpMock()
    setIsResending(false)
    setSecondsLeft(RESEND_SECONDS)
    setCode('')
    setError(null)
    toast.success('A new code has been sent', maskedEmail ? { description: `Check ${maskedEmail}` } : undefined)
  }

  return (
    <AuthCard>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-extrabold text-ink-900">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-500">{description}</p>
        {maskedEmail && <p className="mt-1 text-sm font-semibold text-ink-900">{maskedEmail}</p>}
      </div>

      <OtpInput value={code} onChange={handleChange} error={Boolean(error)} disabled={isVerifying} />

      {error && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-4 text-center text-sm text-ink-500">
        Didn't receive the code?{' '}
        {secondsLeft > 0 ? (
          <span className="font-semibold text-ink-400">Resend OTP in {formatCountdown(secondsLeft)}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            {isResending ? 'Sending…' : 'Resend OTP'}
          </button>
        )}
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={handleVerify} disabled={isVerifying || code.length < 4}>
        {isVerifying ? 'Verifying…' : 'Verify OTP'}
      </Button>

      <div className="mt-5 text-center">
        <Button variant="link" asChild>
          <Link to={backHref}>
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            {backLabel}
          </Link>
        </Button>
      </div>
    </AuthCard>
  )
}
