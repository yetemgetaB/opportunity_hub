import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';

import { UsersRepository } from './users.repository';
import {
  CreateUserData,
  UserLookupResult,
  UserRoleResult,
} from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async getUserById(
    id: string,
  ): Promise<UserLookupResult> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(
        `User with ID '${id}' was not found or is deactivated.`,
      );
    }

    return user;
  }

  async getRoleByAuthId(
    authUserId: string,
  ): Promise<UserRoleResult> {
    if (!authUserId) {
      throw new BadRequestException(
        'Authenticated user identifier is required.',
      );
    }

    const roleInfo =
      await this.usersRepository.findRoleByAuthId(
        authUserId,
      );

    if (!roleInfo) {
      throw new NotFoundException(
        `No application user record found for authenticated identity '${authUserId}'.`,
      );
    }

    return roleInfo;
  }

  async createApplicationUser(
    data: CreateUserData,
  ): Promise<User> {
    if (!data.id) {
      throw new BadRequestException(
        'User ID from Supabase Auth is required.',
      );
    }

    if (!data.firstName || !data.lastName) {
      throw new BadRequestException(
        'First name and last name are required.',
      );
    }

    if (!Object.values(UserRole).includes(data.role)) {
      throw new BadRequestException(
        `Invalid role: '${data.role}'.`,
      );
    }

    return this.usersRepository.create(data);
  }

  async createOrganizationAccount(
    data: CreateUserData,
    organizationName: string,
  ): Promise<User> {
    if (!organizationName?.trim()) {
      throw new BadRequestException(
        'Organization name is required.',
      );
    }

    return this.usersRepository.createOrganizationAccount(
      data,
      organizationName,
    );
  }

  async isUserActive(id: string): Promise<boolean> {
    return this.usersRepository.existsAndActive(id);
  }
}