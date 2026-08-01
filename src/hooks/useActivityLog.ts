import { useQuery } from '@tanstack/react-query'
import { fetchActivityLog, type ActivityQueryParams } from '@/api/activity'

export const activityKeys = {
  all: ['activity'] as const,
  list: (params: ActivityQueryParams) => [...activityKeys.all, 'list', params] as const,
}

export function useActivityLog(params: ActivityQueryParams = {}) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => fetchActivityLog(params),
  })
}
