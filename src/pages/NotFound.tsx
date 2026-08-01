import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Compass className="h-6 w-6" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Page not found</h1>
        <p className="mt-1 text-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      </div>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
