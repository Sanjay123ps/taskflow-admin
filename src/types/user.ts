export type UserRole = 'ADMIN' | 'STAFF'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface StaffMember {
  id: string
  name: string
  employeeId: string
  email: string
  phone: string
  department: string
  designation: string
  role: UserRole
  status: UserStatus
  profileImage: string | null
  joiningDate: string
  createdAt: string
  updatedAt: string
  taskStats?: StaffTaskStats
}

export interface StaffTaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}

export interface AdminProfile {
  id: string
  name: string
  email: string
  role: UserRole
  profileImage: string | null
}

export interface CreateStaffInput {
  name: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string
  profileImage?: string | null
}

export type UpdateStaffInput = Partial<CreateStaffInput> & { status?: UserStatus }
