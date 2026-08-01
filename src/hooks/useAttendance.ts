import { useQuery } from '@tanstack/react-query'
import { fetchAttendance, fetchAttendanceSummary, type AttendanceQueryParams } from '@/api/attendance'

export const attendanceKeys = {
  all: ['attendance'] as const,
  list: (params: AttendanceQueryParams) => [...attendanceKeys.all, 'list', params] as const,
  summary: () => [...attendanceKeys.all, 'summary'] as const,
}

export function useAttendanceList(params: AttendanceQueryParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => fetchAttendance(params),
  })
}

export function useAttendanceSummary() {
  return useQuery({
    queryKey: attendanceKeys.summary(),
    queryFn: fetchAttendanceSummary,
  })
}
