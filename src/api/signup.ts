import axios from 'axios'
import { API_BASE_URL } from './client'

export interface SubmitAdminSignupInput {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  captchaToken?: string
}

export interface OtpIssuedResponse {
  expiresInSeconds: number
  /** Only present outside production, when SMTP isn't configured. */
  devOtp?: string
}

// Uses bare axios calls rather than apiClient: these endpoints are public
// (no auth token to attach yet) and must never trigger the 401/refresh flow.

export async function submitAdminSignupRequest(input: SubmitAdminSignupInput): Promise<OtpIssuedResponse> {
  const { data } = await axios.post<{ success: true; data: OtpIssuedResponse }>(
    `${API_BASE_URL}/admin-signup-requests`,
    input,
  )
  return data.data
}

export async function verifyAdminSignupOtp(email: string, code: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/admin-signup-requests/verify-otp`, { email, code })
}

export async function resendAdminSignupOtp(email: string): Promise<OtpIssuedResponse> {
  const { data } = await axios.post<{ success: true; data: OtpIssuedResponse }>(
    `${API_BASE_URL}/admin-signup-requests/resend-otp`,
    { email },
  )
  return data.data
}
