import { useState } from 'react'
import { Building2, ListChecks, ShieldCheck, UserCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { GeneralSettingsPanel } from '@/components/settings/GeneralSettingsPanel'
import { TaskSettingsPanel } from '@/components/settings/TaskSettingsPanel'
import { AccountSettingsPanel } from '@/components/settings/AccountSettingsPanel'
import { SecuritySettingsPanel } from '@/components/settings/SecuritySettingsPanel'

type SettingsTab = 'general' | 'task' | 'security' | 'account'

const TABS: Array<{ value: SettingsTab; label: string; icon: typeof Building2 }> = [
  { value: 'general', label: 'General Settings', icon: Building2 },
  { value: 'task', label: 'Task Settings', icon: ListChecks },
  { value: 'security', label: 'Security Settings', icon: ShieldCheck },
  { value: 'account', label: 'Account Settings', icon: UserCircle },
]

export default function Settings() {
  const [tab, setTab] = useState<SettingsTab>('general')
  const activeLabel = TABS.find((t) => t.value === tab)?.label

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-ink-400">Dashboard / Settings</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-2">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible">
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors',
                  tab === item.value ? 'bg-brand-700 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-base font-bold text-ink-900">{activeLabel}</h2>
          {tab === 'general' && <GeneralSettingsPanel />}
          {tab === 'task' && <TaskSettingsPanel />}
          {tab === 'security' && <SecuritySettingsPanel />}
          {tab === 'account' && <AccountSettingsPanel />}
        </Card>
      </div>
    </div>
  )
}
