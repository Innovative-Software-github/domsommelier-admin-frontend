import type { UserRole } from '../../auth/roles';

export type { UserRole };

export interface CustomerProfile {
  id: string;
  firstName: string | null;
  secondName: string | null;
  middleName: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
}
