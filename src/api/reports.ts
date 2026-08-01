import { apiClient } from './client'

export type ReportType = 'tasks' | 'staff' | 'activity' | 'attendance'
export type ReportFormat = 'xlsx' | 'csv'

export interface ReportFilters {
  staffId?: string
  status?: string
  priority?: string
  dateFrom?: string
  dateTo?: string
  // Attendance-only filters.
  department?: string
  search?: string
  date?: string
  format: ReportFormat
}

export async function downloadReport(type: ReportType, filters: ReportFilters): Promise<Blob> {
  const { data } = await apiClient.get(`/reports/${type}`, {
    params: filters,
    responseType: 'blob',
  })
  return data
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
