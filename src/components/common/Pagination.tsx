import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageList(page, totalPages)
  const rangeStart = pageSize && totalItems ? (page - 1) * pageSize + 1 : null
  const rangeEnd = pageSize && totalItems ? Math.min(page * pageSize, totalItems) : null

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 sm:flex-row">
      {rangeStart && rangeEnd && totalItems ? (
        <p className="text-xs text-ink-500">
          Showing <span className="font-semibold text-ink-700">{rangeStart}</span>–
          <span className="font-semibold text-ink-700">{rangeEnd}</span> of{' '}
          <span className="font-semibold text-ink-700">{totalItems}</span>
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((entry, idx) =>
          entry === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-ink-300">
              …
            </span>
          ) : (
            <Button
              key={entry}
              variant={entry === page ? 'primary' : 'ghost'}
              size="sm"
              className="h-8 w-8 px-0"
              onClick={() => onPageChange(entry)}
            >
              {entry}
            </Button>
          ),
        )}
        <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function buildPageList(page: number, totalPages: number): Array<number | 'ellipsis'> {
  const delta = 1
  const range: Array<number | 'ellipsis'> = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      range.push(i)
    } else if (range[range.length - 1] !== 'ellipsis') {
      range.push('ellipsis')
    }
  }
  return range
}
