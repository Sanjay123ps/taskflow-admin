import { forwardRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined

interface CaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  error?: string
}

/**
 * hCaptcha widget for public, unauthenticated forms (admin signup). The
 * backend's verifyCaptcha() skips enforcement when CAPTCHA_SECRET_KEY isn't
 * set server-side (local dev), but it does NOT skip just because the token
 * is missing — so once a site key/secret pair is configured, this widget is
 * required for signup to succeed. If VITE_HCAPTCHA_SITE_KEY isn't set, the
 * widget quietly doesn't render rather than breaking the form at build time;
 * set it before relying on CAPTCHA enforcement in production.
 */
const Captcha = forwardRef<HCaptcha, CaptchaProps>(function Captcha({ onVerify, onExpire, error }, ref) {
  if (!SITE_KEY) return null

  return (
    <div>
      <HCaptcha ref={ref} sitekey={SITE_KEY} onVerify={onVerify} onExpire={onExpire} />
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
})

export default Captcha
