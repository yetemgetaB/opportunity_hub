import { UserRole } from '@prisma/client';

export interface CreateUserData {
  /**
   * The authenticated Supabase user ID (from auth.users).
   * Maps 1:1 to public.users.id.
   */
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  role: UserRole;
  avatarUrl?: string | null;
  isActive?: boolean;
}

export interface UserLookupResult {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserRoleResult {
  id: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
}
