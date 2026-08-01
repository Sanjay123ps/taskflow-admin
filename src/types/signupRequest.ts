export type SignupRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface SignupRequest {
  id: string
  name: string
  email: string
  phone: string
  employeeId: string
  status: SignupRequestStatus
  submittedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
}
