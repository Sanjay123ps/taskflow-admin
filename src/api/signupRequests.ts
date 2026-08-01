import { apiClient } from './client'
import type { PaginatedResult, PaginationParams } from '@/types/common'
import type { SignupRequest, SignupRequestStatus } from '@/types/signupRequest'

export interface SignupRequestQueryParams extends PaginationParams {
  status?: SignupRequestStatus | 'ALL'
}

export async function fetchSignupRequests(
  params: SignupRequestQueryParams = {},
): Promise<PaginatedResult<SignupRequest>> {
  const { data } = await apiClient.get<{ success: true; data: PaginatedResult<SignupRequest> }>(
    '/signup-requests',
    { params },
  )
  return data.data
}

export async function approveSignupRequest(id: string): Promise<SignupRequest> {
  const { data } = await apiClient.patch<{ success: true; data: SignupRequest }>(
    `/signup-requests/${id}/approve`,
  )
  return data.data
}

export async function rejectSignupRequest(id: string, reason?: string): Promise<SignupRequest> {
  const { data } = await apiClient.patch<{ success: true; data: SignupRequest }>(
    `/signup-requests/${id}/reject`,
    { reason },
  )
  return data.data
}
