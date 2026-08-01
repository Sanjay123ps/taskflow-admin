import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createStaff,
  deactivateStaff,
  fetchStaff,
  fetchStaffMember,
  reactivateStaff,
  resetStaffPassword,
  updateStaff,
  type StaffQueryParams,
} from '@/api/staff'
import { dashboardKeys } from './useDashboard'
import type { CreateStaffInput, UpdateStaffInput } from '@/types/user'

export const staffKeys = {
  all: ['staff'] as const,
  list: (params: StaffQueryParams) => [...staffKeys.all, 'list', params] as const,
  detail: (id: string) => [...staffKeys.all, 'detail', id] as const,
}

export function useStaffList(params: StaffQueryParams = {}) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => fetchStaff(params),
  })
}

export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: staffKeys.detail(id ?? ''),
    queryFn: () => fetchStaffMember(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateStaffAndDashboard() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: staffKeys.all })
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  }
}

export function useCreateStaff() {
  const invalidate = useInvalidateStaffAndDashboard()
  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaff(input),
    onSuccess: invalidate,
  })
}

export function useUpdateStaff(id: string) {
  const invalidate = useInvalidateStaffAndDashboard()
  return useMutation({
    mutationFn: (input: UpdateStaffInput) => updateStaff(id, input),
    onSuccess: invalidate,
  })
}

export function useDeactivateStaff() {
  const invalidate = useInvalidateStaffAndDashboard()
  return useMutation({
    mutationFn: (id: string) => deactivateStaff(id),
    onSuccess: invalidate,
  })
}

export function useReactivateStaff() {
  const invalidate = useInvalidateStaffAndDashboard()
  return useMutation({
    mutationFn: (id: string) => reactivateStaff(id),
    onSuccess: invalidate,
  })
}

export function useResetStaffPassword() {
  return useMutation({
    mutationFn: (id: string) => resetStaffPassword(id),
  })
}
