import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveSignupRequest,
  fetchSignupRequests,
  rejectSignupRequest,
  type SignupRequestQueryParams,
} from '@/api/signupRequests'

export const signupRequestKeys = {
  all: ['signupRequests'] as const,
  list: (params: SignupRequestQueryParams) => [...signupRequestKeys.all, 'list', params] as const,
}

export function useSignupRequests(params: SignupRequestQueryParams = {}) {
  return useQuery({
    queryKey: signupRequestKeys.list(params),
    queryFn: () => fetchSignupRequests(params),
  })
}

export function useApproveSignupRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approveSignupRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: signupRequestKeys.all }),
  })
}

export function useRejectSignupRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectSignupRequest(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: signupRequestKeys.all }),
  })
}
