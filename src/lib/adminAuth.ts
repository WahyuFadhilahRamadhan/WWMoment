import { createHash } from "crypto";

export const ADMIN_COOKIE_NAME = "wwmoment_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

export function hashAdminPasscode(passcode: string): string {
  return createHash("sha256").update(passcode).digest("hex");
}

function expectedAdminCookieValue(): string | null {
  const passcode = process.env.ADMIN_PASSCODE;
  return passcode ? hashAdminPasscode(passcode) : null;
}

/**
 * Compares an incoming cookie value against the hash of the server-only
 * ADMIN_PASSCODE. The passcode itself never ships to the client - it only
 * ever lives in server environment variables and this hashed cookie.
 */
export function isValidAdminCookie(value: string | undefined): boolean {
  const expected = expectedAdminCookieValue();
  return !!expected && value === expected;
}
