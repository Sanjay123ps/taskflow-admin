import { apiClient } from './client'
import type { AdminProfile } from '@/types/user'

export async function uploadProfilePhoto(file: File): Promise<AdminProfile> {
  const formData = new FormData()
  formData.append('profileImage', file)
  const { data } = await apiClient.post<{ success: true; data: AdminProfile }>('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function removeProfilePhoto(): Promise<AdminProfile> {
  const { data } = await apiClient.delete<{ success: true; data: AdminProfile }>('/profile/photo')
  return data.data
}
