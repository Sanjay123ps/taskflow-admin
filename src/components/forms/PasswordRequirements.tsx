import { CheckCircle2, Circle } from 'lucide-react'
import { PASSWORD_RULES } from '@/lib/password'
import { cn } from '@/lib/utils'

interface PasswordRequirementsProps {
  password: string
  className?: string
}

/** Live checklist of password rules, ticking off each one as the person types. */
export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  return (
    <div className={cn('rounded-xl border border-ink-100 bg-brand-50/50 px-4 py-3.5', className)}>
      <p className="mb-2 text-xs font-semibold text-ink-700">Password must contain:</p>
      <ul className="space-y-1.5">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password)
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-2 text-xs font-medium transition-colors',
                met ? 'text-success' : 'text-ink-400',
              )}
            >
              {met ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0" />
              )}
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
