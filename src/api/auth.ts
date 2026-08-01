import { apiClient, setAccessToken } from './client'
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