/**
 * Referral program utility functions.
 */

const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No 0/O/1/I to avoid confusion

/**
 * Generates a referral code like "CARLOS-A3X7".
 * Takes the user's full name, extracts the first name, uppercases it,
 * and appends a hyphen plus 4 random alphanumeric characters.
 */
export function generateReferralCode(name: string): string {
  const firstName = name.trim().split(/\s+/)[0].toUpperCase()
  const suffix = Array.from({ length: 4 }, () =>
    ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)]
  ).join('')
  return `${firstName}-${suffix}`
}

/**
 * Returns the full referral signup URL for a given code.
 */
export function getReferralUrl(code: string): string {
  return `https://getvorsa.ai/signup?ref=${encodeURIComponent(code)}`
}
