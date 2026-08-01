export type ActivityAction =
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'STAFF_LOGIN'
  | 'STAFF_LOGOUT'
  | 'STAFF_CREATED'
  | 'STAFF_UPDATED'
  | 'STAFF_DEACTIVATED'
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_DELETED'
  | 'SIGNUP_REQUEST_SUBMITTED'
  | 'SIGNUP_REQUEST_APPROVED'
  | 'SIGNUP_REQUEST_REJECTED'

export interface ActivityLogEntry {
  id: string
  userId: string
  userName: string
  userRole: 'ADMIN' | 'STAFF'
  action: ActivityAction
  description: string
  entityType: string | null
  entityId: string | null
  ipAddress: string | null
  createdAt: string
}

export interface ActivityFilters {
  action?: ActivityAction | 'ALL'
  userId?: string
  dateFrom?: string
  dateTo?: string
}
