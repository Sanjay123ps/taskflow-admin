import { useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard'
import { maskEmail } from '@/lib/utils'
import { resendPasswordResetOtp, verifyPasswordResetOtp } from '@/api/auth'

export default function ResetVerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email
  // OtpVerificationCard's onVerified takes no arguments (by design — it's
  // shared with the signup flow, which has nothing to pass). A ref lets
  // handleVerify hand the resetToken to handleVerified without extra state
  // plumbing; it updates synchronously, unlike useState, so it's readable
  // immediately in handleVerified, which always runs right after onVerify resolves.
  const resetTokenRef = useRef('')

  // Can't verify without knowing which address requested the reset — send
  // them back to the forgot-password step rather than an empty OTP card.
  if (!email) {
    return <Navigate to="/admin/forgot-password" replace />
  }

  const handleVerify = async (code: string) => {
    const { resetToken } = await verifyPasswordResetOtp(email, code)
    resetTokenRef.current = resetToken
  }

  const handleVerified = () => {
    navigate('/admin/reset-password', { replace: true, state: { email, resetToken: resetTokenRef.current } })
  }

  return (
    <AuthSplitLayout
      headline="Secure by design."
      description="We use one-time codes to keep every admin account safe and verified."
    >
      <OtpVerificationCard
        title="Enter 4-Digit OTP"
        description="Enter the 4-digit code sent to your registered email address."
        maskedEmail={maskEmail(email)}
        backHref="/admin/forgot-password"
        backLabel="Back to Forgot Password"
        onVerify={handleVerify}
        onVerified={handleVerified}
        onResend={() => resendPasswordResetOtp(email).then(() => undefined)}
      />
    </AuthSplitLayout>
  )
}
