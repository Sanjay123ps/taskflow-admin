import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'

export function ProtectedRoute() {
  const { status, admin } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-700" />
          <p className="text-sm font-medium text-ink-400">Loading your portal…</p>
        </div>
      </div>
    )
  }

  // status can only be 'authenticated' via login()/fetchCurrentAdmin(),
  // both of which already reject non-ADMIN accounts — this is a second,
  // independent check so a future change to either of those can't quietly
  // let a non-admin session reach the app shell again.
  if (status === 'unauthenticated' || admin?.role !== 'ADMIN') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
