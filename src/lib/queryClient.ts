import { QueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from '@/api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const apiError = error as unknown as ApiRequestError
        if (apiError?.kind === 'unauthorized' || apiError?.kind === 'forbidden' || apiError?.kind === 'not_found') {
          return false
        }
        return failureCount < 2
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
