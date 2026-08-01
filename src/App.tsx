import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

import Login from '@/pages/auth/Login'
import AdminSignup from '@/pages/auth/AdminSignup'
import SignupVerifyOtp from '@/pages/auth/SignupVerifyOtp'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetVerifyOtp from '@/pages/auth/ResetVerifyOtp'
import CreateNewPassword from '@/pages/auth/CreateNewPassword'
import PasswordChanged from '@/pages/auth/PasswordChanged'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const StaffManagement = lazy(() => import('@/pages/StaffManagement'))
const NewTask = lazy(() => import('@/pages/NewTask'))
const PendingTasks = lazy(() => import('@/pages/PendingTasks'))
const CompletedTasks = lazy(() => import('@/pages/CompletedTasks'))
const Attendance = lazy(() => import('@/pages/Attendance'))
const ActivityLog = lazy(() => import('@/pages/ActivityLog'))
const DataExport = lazy(() => import('@/pages/DataExport'))
const Settings = lazy(() => import('@/pages/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageFallback() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-700" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/admin/signup/verify-otp" element={<SignupVerifyOtp />} />
              <Route path="/admin/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin/forgot-password/verify-otp" element={<ResetVerifyOtp />} />
              <Route path="/admin/reset-password" element={<CreateNewPassword />} />
              <Route path="/admin/password-changed" element={<PasswordChanged />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/staff" element={<StaffManagement />} />
                <Route path="/tasks/new" element={<NewTask />} />
                <Route path="/tasks/pending" element={<PendingTasks />} />
                <Route path="/tasks/completed" element={<CompletedTasks />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/activity" element={<ActivityLog />} />
                <Route path="/export" element={<DataExport />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
