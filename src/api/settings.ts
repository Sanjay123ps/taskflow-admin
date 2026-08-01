import { apiClient } from './client'
import type { AccountSettings, ActiveSession, GeneralSettings, TaskSettings } from '@/types/settings'

export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  const { data } = await apiClient.get<{ success: true; data: GeneralSettings }>('/settings/general')
  return data.data
}

export async function updateGeneralSettings(input: GeneralSettings): Promise<GeneralSettings> {
  const { data } = await apiClient.patch<{ success: true; data: GeneralSettings }>('/settings/general', input)
  return data.data
}

export async function updateAccountSettings(input: AccountSettings): Promise<AccountSettings> {
  const { data } = await apiClient.patch<{ success: true; data: AccountSettings }>('/settings/account', input)
  return data.data
}

export async function fetchTaskSettings(): Promise<TaskSettings> {
  const { data } = await apiClient.get<{ success: true; data: TaskSettings }>('/settings/tasks')
  return data.data
}

export async function updateTaskSettings(input: TaskSettings): Promise<TaskSettings> {
  const { data } = await apiClient.patch<{ success: true; data: TaskSettings }>('/settings/tasks', input)
  return data.data
}

export async function fetchActiveSessions(): Promise<ActiveSession[]> {
  const { data } = await apiClient.get<{ success: true; data: ActiveSession[] }>('/settings/sessions')
  return data.data
}

export async function logoutAllSessions(): Promise<void> {
  await apiClient.post('/settings/sessions/logout-all')
}
