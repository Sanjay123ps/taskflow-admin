import { Menu, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GlobalSearch } from './GlobalSearch'
import { NotificationsMenu } from './NotificationsMenu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/lib/utils'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="glass-panel sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 sm:block">
        <GlobalSearch />
      </div>
      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-2">
        <NotificationsMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-ink-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={admin?.profileImage ?? undefined} alt={admin?.name} />
                <AvatarFallback>{admin ? initials(admin.name) : 'A'}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-ink-900">{admin?.name ?? 'Admin'}</span>
                <span className="block text-[11px] leading-tight text-ink-400">Super Admin</span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-ink-400 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <UserIcon className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <SettingsIcon className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => logout()}>
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
