import { apiClient } from './client'
import type { PaginatedResult, PaginationParams } from '@/types/common'
import type { AttendanceFilters, AttendanceRecord, AttendanceSummary } from '@/types/attendance'

export interface AttendanceQueryParams extends PaginationParams, AttendanceFilters {}

export async function fetchAttendance(params: AttendanceQueryParams = {}): Promise<PaginatedResult<AttendanceRecord>> {
  const { data } = await apiClient.get<{ success: true; data: PaginatedResult<AttendanceRecord> }>('/attendance', {
    params,
  })
  return data.data
}

export async function fetchAttendanceSummary(): Promise<AttendanceSummary> {
  const { data } = await apiClient.get<{ success: true; data: AttendanceSummary }>('/attendance/summary')
  return data.data
}
