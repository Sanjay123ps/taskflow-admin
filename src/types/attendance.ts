export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'INCOMPLETE'

export interface AttendanceRecord {
  id: string
  staffId: string
  staffName: string
  employeeId: string
  department: string
  date: string
  loginTime: string | null
  logoutTime: string | null
  totalWorkingMinutes: number | null
  status: AttendanceStatus
}

export interface AttendanceSummary {
  totalStaff: number
  presentToday: number
  lateToday: number
  halfDayToday: number
  incompleteToday: number
  absentToday: number
}

export interface AttendanceFilters {
  staffId?: string
  department?: string
  status?: AttendanceStatus | 'ALL'
  date?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
