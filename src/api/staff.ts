import { apiClient } from './client'
import type { PaginatedResult, PaginationParams } from '@/types/common'
import type { CreateStaffInput, StaffMember, UpdateStaffInput } from '@/types/user'

export interface StaffQueryParams extends PaginationParams {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL'
  department?: string
}

export async function fetchStaff(params: StaffQueryParams = {}): Promise<PaginatedResult<StaffMember>> {
  const { data } = await apiClient.get<{ success: true; data: PaginatedResult<StaffMember> }>('/staff', {
    params: { page: 1, ...params },
  })
  return data.data
}

export async function fetchStaffMember(id: string): Promise<StaffMember> {
  const { data } = await apiClient.get<{ success: true; data: StaffMember }>(`/staff/${id}`)
  return data.data
}

export async function createStaff(input: CreateStaffInput): Promise<StaffMember> {
  const { data } = await apiClient.post<{ success: true; data: StaffMember }>('/staff', input)
  return data.data
}

export async function updateStaff(id: string, input: UpdateStaffInput): Promise<StaffMember> {
  const { data } = await apiClient.patch<{ success: true; data: StaffMember }>(`/staff/${id}`, input)
  return data.data
}

export async function deactivateStaff(id: string): Promise<StaffMember> {
  const { data } = await apiClient.patch<{ success: true; data: StaffMember }>(`/staff/${id}`, { status: 'INACTIVE' })
  return data.data
}

export async function reactivateStaff(id: string): Promise<StaffMember> {
  const { data } = await apiClient.patch<{ success: true; data: StaffMember }>(`/staff/${id}`, { status: 'ACTIVE' })
  return data.data
}

export async function resetStaffPassword(id: string): Promise<{ temporaryPassword: string }> {
  const { data } = await apiClient.post<{ success: true; data: { temporaryPassword: string } }>(
    `/staff/${id}/reset-password`,
  )
  return data.data
}
