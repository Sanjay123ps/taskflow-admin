import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard'
import { maskEmail } from '@/lib/utils'
import { resendAdminSignupOtp, verifyAdminSignupOtp } from '@/api/signup'

export default function SignupVerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  // Can't verify without knowing which address to verify — send them back
  // to sign up rather than showing a broken/empty OTP card.
  if (!email) {
    return <Navigate to="/admin/signup" replace />
  }

  const handleVerified = () => {
    toast.success('Email verified', {
      description: 'Your request has been submitted. An existing admin needs to approve it before you can sign in.',
    })
    navigate('/login', { replace: true })
  }

  return (
    <AuthSplitLayout
      headline="Secure by design."
      description="We use one-time codes to keep every admin account safe and verified."
    >
      <OtpVerificationCard
        title="Verify Your Email"
        description="We've sent a 4-digit verification code to your email address."
        maskedEmail={maskEmail(email)}
        backHref="/admin/signup"
        backLabel="Back to Sign Up"
        onVerify={(code) => verifyAdminSignupOtp(email, code)}
        onVerified={handleVerified}
        onResend={() => resendAdminSignupOtp(email).then(() => undefined)}
      />
    </AuthSplitLayout>
  )
}
