import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  /** Optional icon rendered inside the field, to its left (e.g. a Lock icon on a login form). */
  leadingIcon?: ReactNode
}

/**
 * A password field with a show/hide toggle (Eye/EyeOff). Purely a
 * client-side UI affordance — it never stores or logs the password, and
 * doesn't touch validation or submission, so it's safe to drop in
 * anywhere a plain `<input type="password">` is used today.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, leadingIcon, id, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {leadingIcon}
            </span>
          )}
          <Input
            id={inputId}
            ref={ref}
            type={visible ? 'text' : 'password'}
            aria-invalid={Boolean(error)}
            className={cn(leadingIcon && 'pl-10', 'pr-10', className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-r-[var(--radius-control)] text-ink-400 transition-colors hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
