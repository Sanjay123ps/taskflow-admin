import type { ReactNode } from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

interface AuthSplitLayoutProps {
  /** Large heading shown on the brand panel (desktop) — 3-5 words reads best. */
  headline: string
  /** One short supporting sentence under the headline. */
  description: string
  /** Overrides the default shield icon in the brand panel's badge. */
  icon?: ReactNode
  children: ReactNode
}

/**
 * Split-screen shell used by every page in the admin auth flow: a blue
 * brand panel on the left (hidden below `lg`) and the page's own card
 * centered on the right. Keeps branding consistent without each page
 * re-implementing the gradient, logo, and decorative blur shapes.
 */
export function AuthSplitLayout({ headline, description, icon, children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface">
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-extrabold">{APP_NAME}</p>
            <p className="text-[11px] font-medium text-white/60">Admin Portal</p>
          </div>
        </div>

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
              {icon ?? <ShieldCheck className="h-9 w-9" />}
            </div>
          </div>
          <h2 className="font-display text-2xl font-extrabold leading-tight">{headline}</h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">{description}</p>
        </div>

        <div className="relative flex items-center gap-1.5 text-xs text-white/50">
          <ShieldCheck className="h-3.5 w-3.5" />
          Enterprise-grade security for every admin account
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-lg">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-extrabold text-ink-900">{APP_NAME}</p>
            <p className="text-[11px] font-medium text-ink-400">Admin Portal</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AuthCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-[1.75rem] border border-ink-100 bg-white p-8 shadow-[var(--shadow-raised)] sm:p-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
