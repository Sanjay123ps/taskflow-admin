import {
  LayoutDashboard,
  Users,
  ListPlus,
  Clock,
  CheckCircle2,
  CalendarClock,
  History,
  DownloadCloud,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Staff Management', to: '/staff', icon: Users },
  { label: 'New Task', to: '/tasks/new', icon: ListPlus },
  { label: 'Pending Tasks', to: '/tasks/pending', icon: Clock },
  { label: 'Completed Tasks', to: '/tasks/completed', icon: CheckCircle2 },
  { label: 'Attendance', to: '/attendance', icon: CalendarClock },
  { label: 'Activity Log', to: '/activity', icon: History },
  { label: 'Data Export', to: '/export', icon: DownloadCloud },
  { label: 'Settings', to: '/settings', icon: Settings },
]
