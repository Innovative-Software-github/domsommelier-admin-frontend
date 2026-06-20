import type { UserRole } from '../../auth/roles';

export const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_USER: 'Пользователь',
  ROLE_ADMIN: 'Администратор',
};

export function getRoleLabel(role: UserRole | string): string {
  return ROLE_LABELS[role as UserRole] ?? role;
}

export function getRoleColor(role: UserRole | string): string {
  return role === 'ROLE_ADMIN' ? 'gold' : 'default';
}

export const ROLE_FILTER_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ROLE_USER', label: ROLE_LABELS.ROLE_USER },
  { value: 'ROLE_ADMIN', label: ROLE_LABELS.ROLE_ADMIN },
];
