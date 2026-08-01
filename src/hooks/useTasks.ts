import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeTask, createTask, deleteTask, fetchTask, fetchTasks, updateTask, type TaskQueryParams } from '@/api/tasks'
import { dashboardKeys } from './useDashboard'
import { staffKeys } from './useStaff'
import type { CreateTaskInput } from '@/types/task'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (params: TaskQueryParams) => [...taskKeys.all, 'list', params] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
}

export function useTaskList(params: TaskQueryParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasks(params),
  })
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: () => fetchTask(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateTasksAndDashboard() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all })
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    queryClient.invalidateQueries({ queryKey: staffKeys.all })
  }
}

export function useCreateTask() {
  const invalidate = useInvalidateTasksAndDashboard()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: invalidate,
  })
}

export function useUpdateTask(id: string) {
  const invalidate = useInvalidateTasksAndDashboard()
  return useMutation({
    mutationFn: (input: Partial<CreateTaskInput> & { status?: string }) => updateTask(id, input),
    onSuccess: invalidate,
  })
}

export function useCompleteTask() {
  const invalidate = useInvalidateTasksAndDashboard()
  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: invalidate,
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasksAndDashboard()
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: invalidate,
  })
}
