import { User, UserRole } from '@prisma/client';
import { UserLookupResult } from '@/users/users.interface';

export class AdminProfileResponseDto {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromUser(user: User | UserLookupResult): AdminProfileResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      middleName: user.middleName ?? null,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
