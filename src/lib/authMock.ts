/**
 * Mock helpers for the Admin Authentication UI flow.
 *
 * These simulate the OTP/email round trip so the UI can be built and tested
 * end-to-end before SMTP and the real OTP backend are wired up in a later
 * phase. Nothing here talks to a server — swap these out for real API calls
 * (see `@/api/auth`) once that phase begins.
 */

/** The only code the mock verifier accepts. Use this while testing the UI. */
export const MOCK_VALID_OTP = '1234'

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Simulates verifying an OTP against the backend. */
export async function verifyOtpMock(code: string): Promise<boolean> {
  await delay(800)
  return code === MOCK_VALID_OTP
}

/** Simulates asking the backend to resend an OTP. */
export async function resendOtpMock(): Promise<void> {
  await delay(600)
}

/** Masks an email address for display, e.g. "admin@taskflow.com" -> "ad***@taskflow.com". */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return email
  return `${user.slice(0, 2)}***@${domain}`
}
