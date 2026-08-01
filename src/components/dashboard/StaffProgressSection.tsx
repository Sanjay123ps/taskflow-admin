import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { StaffProgressCard } from './StaffProgressCard'
import type { StaffMember } from '@/types/user'

interface StaffProgressSectionProps {
  staff: StaffMember[]
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry: () => void
  onSelectStaff: (staff: StaffMember) => void
  onViewAll: () => void
}

export function StaffProgressSection({
  staff,
  isLoading,
  isError,
  error,
  onRetry,
  onSelectStaff,
  onViewAll,
}: StaffProgressSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({ startX: 0, startScrollLeft: 0 })

  const scrollByAmount = useCallback((amount: number) => {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!scrollerRef.current) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollerRef.current.scrollLeft += e.deltaY
    }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollerRef.current) return
    setIsDragging(true)
    dragState.current = { startX: e.clientX, startScrollLeft: scrollerRef.current.scrollLeft }
    scrollerRef.current.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !scrollerRef.current) return
      const delta = e.clientX - dragState.current.startX
      scrollerRef.current.scrollLeft = dragState.current.startScrollLeft - delta
    },
    [isDragging],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false)
    scrollerRef.current?.releasePointerCapture(e.pointerId)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Progress Overview</CardTitle>
        <div className="flex items-center gap-1.5">
          <Button variant="link" size="sm" onClick={onViewAll}>
            View All Staff
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => scrollByAmount(-260)} aria-label="Scroll left">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => scrollByAmount(260)} aria-label="Scroll right">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="p-5">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[248px] w-[220px] shrink-0 rounded-[var(--radius-card)]" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : staff.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No staff members found."
            description="Create your first staff member to start assigning tasks."
          />
        ) : (
          <div
            ref={scrollerRef}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`scroll-snap-x no-scrollbar flex gap-4 overflow-x-auto pb-1 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          >
            {staff.map((member) => (
              <StaffProgressCard key={member.id} staff={member} onClick={() => onSelectStaff(member)} />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
