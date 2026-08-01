import { apiClient } from './client'
import type { PaginatedResult, PaginationParams } from '@/types/common'
import type { ActivityFilters, ActivityLogEntry } from '@/types/activity'

export interface ActivityQueryParams extends PaginationParams, ActivityFilters {}

export async function fetchActivityLog(params: ActivityQueryParams = {}): Promise<PaginatedResult<ActivityLogEntry>> {
  const { data } = await apiClient.get<{ success: true; data: PaginatedResult<ActivityLogEntry> }>(
    '/admin/activity',
    { params },
  )
  return data.data
}
