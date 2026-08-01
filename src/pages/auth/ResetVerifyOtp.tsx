import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard'
import { maskEmail } from '@/lib/authMock'

export default function ResetVerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  // Can't verify without knowing which address requested the reset — send
  // them back to the forgot-password step rather than an empty OTP card.
  if (!email) {
    return <Navigate to="/admin/forgot-password" replace />
  }

  const handleVerified = () => {
    navigate('/admin/reset-password', { replace: true, state: { email } })
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
        onVerified={handleVerified}
      />
    </AuthSplitLayout>
  )
}
