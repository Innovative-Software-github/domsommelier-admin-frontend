import type { UserRole } from '../customer/interfaces';

export interface AuthInitiateResponse {
  success: string;
}

export interface AuthConfirmResponse {
  token: string;
  customerId: string;
  firstName: string | null;
  secondName: string | null;
  role: UserRole;
}
