import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string
  supportingText?: string
  trend?: number
  tone: 'brand' | 'warning' | 'success' | 'violet' | 'danger'
}

const TONE_STYLES: Record<KpiCardProps['tone'], string> = {
  brand: 'bg-brand-100 text-brand-700',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  violet: 'bg-violet-soft text-violet',
  danger: 'bg-danger-soft text-danger',
}

export function KpiCard({ icon: Icon, label, value, supportingText, trend, tone }: KpiCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-[var(--shadow-raised)]">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-2 font-display text-[28px] font-extrabold leading-none tabular-nums text-ink-900">
            {value}
          </p>
          {(supportingText || typeof trend === 'number') && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {typeof trend === 'number' && trend !== 0 && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-semibold',
                    trend > 0 ? 'text-success' : 'text-danger',
                  )}
                >
                  {trend > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(trend)}%
                </span>
              )}
              {supportingText && <span className="text-xs text-ink-400">{supportingText}</span>}
            </div>
          )}
        </div>
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', TONE_STYLES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  )
}
