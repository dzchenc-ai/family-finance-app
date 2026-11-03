/**
 * Bootstrap admin that predates the role column. Still treated as admin
 * wherever the app already special-cases this address.
 */
const LEGACY_ADMIN_EMAIL = "mobowp027@gmail.com";

export function isAdminUser(
  user: { email?: string | null; role?: string | null } | null | undefined,
): boolean {
  if (!user) return false;
  return user.email === LEGACY_ADMIN_EMAIL || user.role === "ADMIN";
}
