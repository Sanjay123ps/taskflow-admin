export interface GeneralSettings {
  companyName: string
  companyLogo: string | null
  timezone: string
  dateFormat: string
}

export interface AccountSettings {
  name: string
  email: string
  profileImage: string | null
}

export interface TaskSettings {
  defaultPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

export interface ActiveSession {
  id: string
  device: string
  ipAddress: string
  lastActiveAt: string
  current: boolean
}
