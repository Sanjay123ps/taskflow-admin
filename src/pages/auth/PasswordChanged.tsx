import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthSplitLayout, AuthCard } from '@/components/auth/AuthSplitLayout'

export default function PasswordChanged() {
  return (
    <AuthSplitLayout
      headline="Password Changed Successfully"
      description="Your password has been updated. You can now sign in with your new password."
    >
      <AuthCard className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-xl font-extrabold text-ink-900">Password Changed Successfully!</h1>
        <p className="mt-2 text-sm text-ink-500">
          Your password has been updated successfully. You can now log in with your new password.
        </p>

        <Button asChild className="mt-7 w-full" size="lg">
          <Link to="/login">Go to Login</Link>
        </Button>

        <div className="mt-4">
          <Button variant="link" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </AuthCard>
    </AuthSplitLayout>
  )
}
