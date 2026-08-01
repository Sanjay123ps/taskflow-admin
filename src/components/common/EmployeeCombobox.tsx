import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Search, ChevronDown, Check, Loader2, X } from 'lucide-react'
import { useStaffList, useStaffMember } from '@/hooks/useStaff'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'
import type { StaffMember } from '@/types/user'

interface EmployeeComboboxProps {
  id?: string
  value: string
  onChange: (staffId: string, staff: StaffMember | null) => void
  disabled?: boolean
  hasError?: boolean
}

/**
 * Searchable + scrollable employee picker. Admins can click to browse the
 * active staff list, or type to search by name / Employee ID — both paths
 * always resolve to a real Profile id (never a typed-in name), which is
 * what gets sent to the backend as `assignedToId`.
 */
export function EmployeeCombobox({ id, value, onChange, disabled, hasError }: EmployeeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [localSelected, setLocalSelected] = useState<StaffMember | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebouncedValue(query, 300)

  // Resolves the display name when `value` arrives from outside (e.g. a
  // staffId passed in via navigation state) rather than from a selection
  // made in this component.
  const { data: resolvedStaff } = useStaffMember(value || null)

  const { data: staffData, isLoading } = useStaffList({
    status: 'ACTIVE',
    search: debouncedQuery.trim() || undefined,
    pageSize: 20,
  })

  const results = staffData?.items ?? []
  const selectedStaff = localSelected ?? resolvedStaff ?? null

  useEffect(() => {
    if (!value) setLocalSelected(null)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [debouncedQuery, open])

  function selectStaff(staff: StaffMember) {
    setLocalSelected(staff)
    onChange(staff.id, staff)
    setOpen(false)
    setQuery('')
  }

  function clearSelection() {
    setLocalSelected(null)
    onChange('', null)
    setQuery('')
    inputRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const staff = results[highlightedIndex]
      if (staff) selectStaff(staff)
    } else if (event.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const displayValue = open ? query : selectedStaff ? `${selectedStaff.name} — ${selectedStaff.employeeId}` : ''

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Select or search employee…"
          className={cn(
            'flex h-10 w-full rounded-[var(--radius-control)] border bg-white pl-10 pr-16 text-sm text-ink-900 placeholder:text-ink-400 shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError ? 'border-danger' : 'border-ink-200',
          )}
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {selectedStaff && !open && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
              aria-label="Clear selected employee"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-ink-100 bg-white p-1.5 shadow-[var(--shadow-raised)]">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-ink-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-400">
              {debouncedQuery.trim() ? `No active staff match "${debouncedQuery.trim()}"` : 'No active staff found'}
            </p>
          ) : (
            results.map((staff, index) => (
              <button
                key={staff.id}
                type="button"
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectStaff(staff)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                  index === highlightedIndex ? 'bg-brand-50 text-brand-700' : 'text-ink-700',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{staff.name}</span>
                  <span className="block truncate text-xs text-ink-400">
                    {staff.employeeId}
                    {staff.department ? ` · ${staff.department}` : ''}
                  </span>
                </span>
                {staff.id === value && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
