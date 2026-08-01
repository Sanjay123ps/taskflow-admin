import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import type { AnalyticsRange, TaskAnalyticsPoint } from '@/types/dashboard'

interface TaskAnalyticsChartProps {
  data: TaskAnalyticsPoint[]
  counters: { created: number; completed: number; pending: number; overdue: number }
  range: AnalyticsRange
  onRangeChange: (range: AnalyticsRange) => void
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry: () => void
}

const RANGE_LABELS: Record<Exclude<AnalyticsRange, 'custom'>, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
}

export function TaskAnalyticsChart({
  data,
  counters,
  range,
  onRangeChange,
  isLoading,
  isError,
  error,
  onRetry,
}: TaskAnalyticsChartProps) {
  return (
    <Card>
      <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center">
        <CardTitle>Tasks Overview {range !== 'custom' ? `(${RANGE_LABELS[range]})` : ''}</CardTitle>
        <Tabs value={range} onValueChange={(v) => onRangeChange(v as AnalyticsRange)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <div className="px-5 pt-4">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : data.length === 0 ? (
          <EmptyState icon={BarChart3} title="No task activity yet" description="Once tasks are created, trends will appear here." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-ink-100)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-ink-400)' }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--color-ink-400)' }} width={28} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--color-ink-100)',
                  boxShadow: 'var(--shadow-raised)',
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stroke="var(--color-brand-600)"
                strokeWidth={2.5}
                fill="url(#createdGradient)"
                name="Created"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 pt-4 sm:grid-cols-4">
        <Counter label="Created" value={counters.created} tone="brand" />
        <Counter label="Completed" value={counters.completed} tone="success" />
        <Counter label="Pending" value={counters.pending} tone="warning" />
        <Counter label="Overdue" value={counters.overdue} tone="danger" />
      </div>
    </Card>
  )
}

function Counter({ label, value, tone }: { label: string; value: number; tone: 'brand' | 'success' | 'warning' | 'danger' }) {
  const dot = { brand: 'bg-brand-600', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' }[tone]
  return (
    <div className="rounded-xl border border-ink-100 p-3">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-xs font-medium text-ink-500">{label}</p>
      </div>
      <p className="mt-1.5 text-xl font-extrabold tabular-nums text-ink-900">{value}</p>
    </div>
  )
}
