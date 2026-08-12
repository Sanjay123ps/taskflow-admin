import axios from 'axios'
import { API_BASE_URL, apiClient, setAccessToken } from './client'
import type { AdminProfile } from '@/types/user'

export interface LoginInput {
  email: string
  password: string
}

interface LoginResponseData {
  accessToken: string
  admin?: AdminProfile
  // Present instead of `admin` when a STAFF account authenticates — the
  // backend's /auth/login is shared by both portals and doesn't reject by
  // role itself (see auth.middleware.ts: frontend guards are UX only, the
  // API is the real gate). This portal must refuse to proceed when it's
  // not actually an admin, rather than silently rendering with whatever
  // fields happen to overlap.
  staff?: unknown
}

export async function login(input: LoginInput): Promise<AdminProfile> {
  const { data } = await apiClient.post<{ success: true; data: LoginResponseData }>('/auth/login', input)

  if (!data.data.admin) {
    setAccessToken(null)
    throw { message: 'This account does not have admin access.' }
  }

  setAccessToken(data.data.accessToken)
  return data.data.admin
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    setAccessToken(null)
  }
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  await apiClient.post('/auth/change-password', input)
}

export async function fetchCurrentAdmin(): Promise<AdminProfile> {
  const { data } = await apiClient.get<{ success: true; data: AdminProfile }>('/auth/me')

  // /auth/me returns whichever profile DTO matches the caller's real role
  // (see getMe() in auth.service.ts) — for a STAFF token that's the staff
  // DTO, not an AdminProfile, even though several fields (name, id) happen
  // to line up. Check the role explicitly rather than trusting the shape.
  if (data.data.role !== 'ADMIN') {
    setAccessToken(null)
    throw { message: 'This account does not have admin access.' }
  }

  return data.data
}

export interface OtpIssuedResponse {
  expiresInSeconds: number
  /** Only present outside production, when SMTP isn't configured. */
  devOtp?: string
}

// Forgot Password flow — public endpoints, bare axios (no access token yet,
// and must never trigger the 401/refresh interceptor).

export async function forgotPassword(email: string): Promise<OtpIssuedResponse> {
  const { data } = await axios.post<{ success: true; data: OtpIssuedResponse }>(
    `${API_BASE_URL}/auth/password/forgot`,
    { email },
  )
  return data.data
}

export async function resendPasswordResetOtp(email: string): Promise<OtpIssuedResponse> {
  const { data } = await axios.post<{ success: true; data: OtpIssuedResponse }>(
    `${API_BASE_URL}/auth/password/resend-otp`,
    { email },
  )
  return data.data
}

export async function verifyPasswordResetOtp(email: string, code: string): Promise<{ resetToken: string }> {
  const { data } = await axios.post<{ success: true; data: { resetToken: string; expiresInSeconds: number } }>(
    `${API_BASE_URL}/auth/password/verify-otp`,
    { email, code },
  )
  return data.data
}

export async function resetPassword(resetToken: string, newPassword: string, confirmPassword: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/auth/password/reset`, { resetToken, newPassword, confirmPassword })
}