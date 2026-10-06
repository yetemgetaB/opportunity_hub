import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersRepository } from '@/users/users.repository';
import { AdminProfileResponseDto } from './dto/admin-profile-response.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@Injectable()
export class AdminService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Retrieve the profile for an authenticated administrator.
   */
  async getProfile(adminUserId: string): Promise<AdminProfileResponseDto> {
    const user = await this.usersRepository.findById(adminUserId);

    if (!user || !user.isActive) {
      throw new NotFoundException('Admin user not found or is deactivated.');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Access denied: User is not an administrator.',
      );
    }

    return AdminProfileResponseDto.fromUser(user);
  }

  /**
   * Update editable profile fields for an authenticated administrator.
   */
  async updateProfile(
    adminUserId: string,
    dto: UpdateAdminProfileDto,
  ): Promise<AdminProfileResponseDto> {
    // Validate existence, active status, and ADMIN role
    await this.getProfile(adminUserId);

    const updatedUser = await this.usersRepository.update(adminUserId, {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      avatarUrl: dto.avatarUrl,
    });

    return AdminProfileResponseDto.fromUser(updatedUser);
  }
}
