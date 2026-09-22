import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User, UserRole } from '@prisma/client';
import {
  CreateUserData,
  UserLookupResult,
  UserRoleResult,
} from './users.interface';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Look up user by ID. Throws NotFoundException if missing or soft-deleted.
   */
  async getUserById(id: string): Promise<UserLookupResult> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' was not found or is deactivated.`);
    }
    return user;
  }

  /**
   * Entry point for Backend 1 auth middleware / guards to verify identity and retrieve role.
   */
  async getRoleByAuthId(authUserId: string): Promise<UserRoleResult> {
    if (!authUserId) {
      throw new BadRequestException('Authenticated user identifier is required.');
    }

    const roleInfo = await this.usersRepository.findRoleByAuthId(authUserId);
    if (!roleInfo) {
      throw new NotFoundException(
        `No application user record found for authenticated identity '${authUserId}'.`,
      );
    }

    return roleInfo;
  }

  /**
   * Persists a newly registered user profile associated with a Supabase Auth account.
   */
  async createApplicationUser(data: CreateUserData): Promise<User> {
    if (!data.id) {
      throw new BadRequestException('User ID from Supabase Auth is required.');
    }

    if (!data.firstName || !data.lastName) {
      throw new BadRequestException('First name and last name are required.');
    }

    if (!Object.values(UserRole).includes(data.role)) {
      throw new BadRequestException(`Invalid role: '${data.role}'.`);
    }

    return this.usersRepository.create(data);
  }

  /**
   * Check if a user is active.
   */
  async isUserActive(id: string): Promise<boolean> {
    return this.usersRepository.existsAndActive(id);
  }
}
