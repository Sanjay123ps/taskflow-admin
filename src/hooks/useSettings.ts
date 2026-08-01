import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchActiveSessions,
  fetchGeneralSettings,
  fetchTaskSettings,
  logoutAllSessions,
  updateAccountSettings,
  updateGeneralSettings,
  updateTaskSettings,
} from '@/api/settings'
import type { AccountSettings, GeneralSettings, TaskSettings } from '@/types/settings'

const settingsKeys = {
  general: ['settings', 'general'] as const,
  task: ['settings', 'task'] as const,
  sessions: ['settings', 'sessions'] as const,
}

export function useGeneralSettings() {
  return useQuery({ queryKey: settingsKeys.general, queryFn: fetchGeneralSettings })
}

export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: GeneralSettings) => updateGeneralSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.general }),
  })
}

export function useUpdateAccountSettings() {
  return useMutation({
    mutationFn: (input: AccountSettings) => updateAccountSettings(input),
  })
}

export function useTaskSettings() {
  return useQuery({ queryKey: settingsKeys.task, queryFn: fetchTaskSettings })
}

export function useUpdateTaskSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskSettings) => updateTaskSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.task }),
  })
}

export function useActiveSessions() {
  return useQuery({ queryKey: settingsKeys.sessions, queryFn: fetchActiveSessions })
}

export function useLogoutAllSessions() {
  return useMutation({ mutationFn: logoutAllSessions })
}
