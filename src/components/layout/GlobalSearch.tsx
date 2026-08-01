import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User as UserIcon, ClipboardList, Loader2 } from 'lucide-react'
import { fetchStaff } from '@/api/staff'
import { fetchTasks } from '@/api/tasks'
import type { StaffMember } from '@/types/user'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [staffResults, setStaffResults] = useState<StaffMember[]>([])
  const [taskResults, setTaskResults] = useState<Task[]>([])
  const [searchError, setSearchError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setStaffResults([])
      setTaskResults([])
      setSearchError(false)
      return
    }
    setLoading(true)
    setSearchError(false)
    const timeout = setTimeout(async () => {
      try {
        const [staff, tasks] = await Promise.all([
          fetchStaff({ search: query, pageSize: 4 }),
          fetchTasks({ search: query, pageSize: 4 }),
        ])
        setStaffResults(staff.items)
        setTaskResults(tasks.items)
      } catch {
        setSearchError(true)
        setStaffResults([])
        setTaskResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(timeout)
  }, [query])

  const hasResults = staffResults.length > 0 || taskResults.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search staff or tasks…"
        className="h-10 w-full rounded-xl border border-ink-200 bg-ink-50/60 pl-10 pr-16 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ink-400 sm:block">
        Ctrl K
      </kbd>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-ink-100 bg-white p-2 shadow-[var(--shadow-raised)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          ) : searchError ? (
            <p className="px-3 py-6 text-center text-sm text-ink-400">Search isn't available right now.</p>
          ) : !hasResults ? (
            <p className="px-3 py-6 text-center text-sm text-ink-400">No matches for "{query}"</p>
          ) : (
            <>
              {staffResults.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Staff</p>
                  {staffResults.map((staff) => (
                    <ResultRow
                      key={staff.id}
                      icon={UserIcon}
                      title={staff.name}
                      subtitle={staff.employeeId}
                      onClick={() => {
                        navigate('/staff', { state: { openStaffId: staff.id } })
                        setOpen(false)
                        setQuery('')
                      }}
                    />
                  ))}
                </div>
              )}
              {taskResults.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Tasks</p>
                  {taskResults.map((task) => (
                    <ResultRow
                      key={task.id}
                      icon={ClipboardList}
                      title={task.title}
                      subtitle={task.assignedTo?.name ?? 'Unassigned'}
                      onClick={() => {
                        navigate(task.status === 'COMPLETED' ? '/tasks/completed' : '/tasks/pending')
                        setOpen(false)
                        setQuery('')
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ResultRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: typeof UserIcon
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-brand-50',
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink-900">{title}</span>
        <span className="block truncate text-xs text-ink-400">{subtitle}</span>
      </span>
    </button>
  )
}
