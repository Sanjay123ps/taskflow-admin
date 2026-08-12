import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

// Access tokens are short-lived, so they're kept in memory only (never in
// localStorage/sessionStorage) to reduce exposure if a third-party script on
// the page were ever compromised (XSS). The refresh token is what survives
// a reload, and it lives in an httpOnly cookie the JS layer never touches.
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // refresh token travels as an httpOnly cookie
  timeout: 20000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Structured error every API call rejects with, so UI code never has to
 * poke at axios internals to render a friendly message.
 */
export interface ApiRequestError {
  status: number | null
  message: string
  errors?: Array<{ field?: string; message: string }>
  kind: 'network' | 'unauthorized' | 'forbidden' | 'validation' | 'not_found' | 'server' | 'unknown'
}

let isRefreshing = false
let pendingQueue: Array<() => void> = []

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post<{ success: boolean; data: { accessToken: string } }>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    const token = response.data.data.accessToken
    setAccessToken(token)
    return token
  } catch {
    setAccessToken(null)
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Array<{ field?: string; message: string }> }>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!error.response) {
      return Promise.reject<ApiRequestError>({
        status: null,
        message: 'Could not reach the server. Check your connection and try again.',
        kind: 'network',
      })
    }

    const { status, data } = error.response

    // Attempt exactly one silent refresh on a 401, then replay the request.
    if (status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingQueue.push(resolve))
      } else {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false
        pendingQueue.forEach((resolve) => resolve())
        pendingQueue = []
        if (!newToken) {
          window.dispatchEvent(new CustomEvent('taskflow:session-expired'))
          return Promise.reject<ApiRequestError>({
            status: 401,
            message: 'Your session has expired. Please sign in again.',
            kind: 'unauthorized',
          })
        }
      }
      originalRequest._retry = true
      return apiClient(originalRequest)
    }

    const message = data?.message ?? fallbackMessageFor(status)
    const kind: ApiRequestError['kind'] =
      status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : status === 404 ? 'not_found' : status === 422 || status === 400 ? 'validation' : status >= 500 ? 'server' : 'unknown'

    return Promise.reject<ApiRequestError>({ status, message, errors: data?.errors, kind })
  },
)

function fallbackMessageFor(status: number): string {
  switch (status) {
    case 401:
      return 'You need to sign in to continue.'
    case 403:
      return "You don't have permission to do that."
    case 404:
      return 'That resource could not be found.'
    case 422:
    case 400:
      return 'Please check the form and try again.'
    default:
      return status >= 500 ? 'Something went wrong on our end. Please try again shortly.' : 'Something went wrong.'
  }
}
