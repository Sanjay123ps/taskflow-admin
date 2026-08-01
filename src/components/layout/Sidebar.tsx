import { NavLink } from 'react-router-dom'
import { LogOut, ShieldCheck, Sparkles } from 'lucide-react'
import { NAV_ITEMS } from './navConfig'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { initials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/lib/constants'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { admin, logout } = useAuth()

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-brand-900 via-brand-800 to-brand-950 text-white">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="font-display text-[15px] font-bold leading-none">{APP_NAME}</p>
          <p className="mt-1 text-[11px] font-medium text-brand-200">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 no-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white text-brand-800 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]'
                  : 'text-brand-100 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={['h-[18px] w-[18px]', isActive ? 'text-brand-700' : 'text-brand-200 group-hover:text-white'].join(' ')} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="glass-dark flex items-center gap-3 rounded-xl p-3">
          <Avatar className="h-10 w-10 ring-2 ring-white/20">
            <AvatarImage src={admin?.profileImage ?? undefined} alt={admin?.name} />
            <AvatarFallback className="bg-white/15 text-white">{admin ? initials(admin.name) : 'A'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{admin?.name ?? 'Admin'}</p>
            <p className="flex items-center gap-1 text-[11px] font-medium text-brand-200">
              <ShieldCheck className="h-3 w-3" />
              Super Admin
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-lg p-2 text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
