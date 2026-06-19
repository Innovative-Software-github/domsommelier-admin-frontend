export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export function isAdmin(role: UserRole | string | null | undefined): boolean {
  return role === 'ROLE_ADMIN';
}
