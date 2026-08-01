import { apiClient } from './client'
import type { AnalyticsRange, DashboardSummary } from '@/types/dashboard'

export async function fetchDashboardSummary(range: AnalyticsRange = 'week'): Promise<DashboardSummary> {
  const { data } = await apiClient.get<{ success: true; data: DashboardSummary }>('/admin/dashboard', {
    params: { range },
  })
  return data.data
}
