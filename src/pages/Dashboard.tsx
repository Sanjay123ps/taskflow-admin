import { useState } from 'react'
import { ClipboardList, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useAuth } from '@/hooks/useAuth'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { StaffProgressSection } from '@/components/dashboard/StaffProgressSection'
import { StaffDetailModal } from '@/components/dashboard/StaffDetailModal'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { TaskAnalyticsChart } from '@/components/dashboard/TaskAnalyticsChart'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsRange } from '@/types/dashboard'
import type { StaffMember } from '@/types/user'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { admin } = useAuth()
  const navigate = useNavigate()
  const [range, setRange] = useState<AnalyticsRange>('week')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)

  const { data, isLoading, isError, error, refetch } = useDashboardSummary(range)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-[26px]">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">
          Welcome back{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}. Here's what's happening today.
        </p>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[108px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-[var(--radius-card)] border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          Couldn't load dashboard statistics.{' '}
          <button className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            icon={ClipboardList}
            label="Total Tasks"
            value={String(data?.kpis.totalTasks ?? 0)}
            supportingText="All time"
            trend={data?.kpis.totalTasksTrend}
            tone="brand"
          />
          <KpiCard
            icon={Clock}
            label="Pending Tasks"
            value={String(data?.kpis.pendingTasks ?? 0)}
            supportingText="Currently pending"
            trend={data?.kpis.pendingTasksTrend}
            tone="warning"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Completed Tasks"
            value={String(data?.kpis.completedTasks ?? 0)}
            supportingText="All completed"
            trend={data?.kpis.completedTasksTrend}
            tone="success"
          />
          <KpiCard
            icon={TrendingUp}
            label="Completion Rate"
            value={`${data?.kpis.completionRate ?? 0}%`}
            supportingText="Overall performance"
            trend={data?.kpis.completionRateTrend}
            tone="violet"
          />
        </div>
      )}

      <StaffProgressSection
        staff={data?.staffProgress ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onSelectStaff={setSelectedStaff}
        onViewAll={() => navigate('/staff')}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <RecentActivity
            activity={data?.recentActivity ?? []}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
          />
        </div>
        <div className="xl:col-span-3">
          <TaskAnalyticsChart
            data={data?.analytics ?? []}
            counters={data?.taskCounters ?? { created: 0, completed: 0, pending: 0, overdue: 0 }}
            range={range}
            onRangeChange={setRange}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
          />
        </div>
      </div>

      <StaffDetailModal staff={selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)} />
    </div>
  )
}
