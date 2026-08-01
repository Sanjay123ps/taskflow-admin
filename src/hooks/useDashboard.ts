import { useQuery } from '@tanstack/react-query'
import { fetchDashboardSummary } from '@/api/dashboard'
import type { AnalyticsRange } from '@/types/dashboard'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (range: AnalyticsRange) => [...dashboardKeys.all, range] as const,
}

export function useDashboardSummary(range: AnalyticsRange = 'week') {
  return useQuery({
    queryKey: dashboardKeys.summary(range),
    queryFn: () => fetchDashboardSummary(range),
    staleTime: 15_000,
  })
}
