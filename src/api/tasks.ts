import { apiClient } from './client'
import type { PaginatedResult, PaginationParams } from '@/types/common'
import type { CreateTaskInput, Task, TaskFilters } from '@/types/task'

export interface TaskQueryParams extends PaginationParams, TaskFilters {}

export async function fetchTasks(params: TaskQueryParams = {}): Promise<PaginatedResult<Task>> {
  const { data } = await apiClient.get<{ success: true; data: PaginatedResult<Task> }>('/tasks', { params })
  return data.data
}

export async function fetchTask(id: string): Promise<Task> {
  const { data } = await apiClient.get<{ success: true; data: Task }>(`/tasks/${id}`)
  return data.data
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const formData = new FormData()
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === 'attachment' && value instanceof File) {
      formData.append('attachment', value)
    } else {
      formData.append(key, String(value))
    }
  })
  const { data } = await apiClient.post<{ success: true; data: Task }>('/tasks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function updateTask(id: string, input: Partial<CreateTaskInput> & { status?: string }): Promise<Task> {
  const { data } = await apiClient.patch<{ success: true; data: Task }>(`/tasks/${id}`, input)
  return data.data
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}

export async function completeTask(id: string): Promise<Task> {
  const { data } = await apiClient.patch<{ success: true; data: Task }>(`/tasks/${id}`, { status: 'COMPLETED' })
  return data.data
}
