export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: {
    id: string
    name: string
    employeeId: string
    profileImage: string | null
  } | null
  createdById: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  dueTime: string
  attachmentUrl: string | null
  notes: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description: string
  assignedToId: string
  priority: TaskPriority
  dueDate: string
  dueTime: string
  notes?: string
  attachment?: File | null
}

export interface TaskFilters {
  staffId?: string
  priority?: TaskPriority | 'ALL'
  status?: TaskStatus | 'ALL'
  overdueOnly?: boolean
  excludeCompleted?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
}
