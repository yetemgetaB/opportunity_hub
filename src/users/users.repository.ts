import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  CreateUserData,
  UserLookupResult,
  UserRoleResult,
} from './users.interface';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Look up an application user by their primary identifier.
   * In this architecture, public.users.id is identical to Supabase auth.users.id.
   *
   * @param id The user UUID (auth.users.id == public.users.id)
   * @param includeDeleted Whether to include soft-deleted accounts (default: false)
   */
  async findById(
    id: string,
    includeDeleted: boolean = false,
  ): Promise<UserLookupResult | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    if (!includeDeleted && user.deletedAt !== null) {
      return null;
    }

    return user;
  }

  /**
   * Primary entry point for Backend 1 to retrieve an authenticated user's role and status.
   * "Which application user is this authenticated Supabase user, and what is their role?"
   *
   * @param authUserId The UUID from Supabase Auth (JWT sub / auth.uid())
   */
  async findRoleByAuthId(authUserId: string): Promise<UserRoleResult | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: authUserId },
      select: {
        id: true,
        role: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      role: user.role,
      isActive: user.isActive,
      isDeleted: user.deletedAt !== null,
    };
  }

  /**
   * Creates the public.users record corresponding to a freshly registered Supabase Auth user.
   * Ensures:
   * - ID maps 1:1 to auth.users.id
   * - Role is strictly typed to domain ENUM ('STUDENT', 'ORGANIZATION', 'ADMIN')
   * - No password / credentials ever stored in application DB
   *
   * @param data User creation payload
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          id: data.id,
          firstName: data.firstName.trim(),
          middleName: data.middleName ? data.middleName.trim() : null,
          lastName: data.lastName.trim(),
          role: data.role,
          avatarUrl: data.avatarUrl || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      this.logger.log(
        `Created application user record for ID: ${newUser.id} with role: ${newUser.role}`,
      );
      return newUser;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Application user record already exists for ID: ${data.id}`,
        );
      }
      throw error;
    }
  }

  /**
   * Checks whether an application user exists and is active.
   */
  async existsAndActive(id: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    return !!user;
  }

  /**
   * Soft-deletes a user account by setting deleted_at timestamp.
   * Preserves historical relational data in line with ADR-005.
   */
  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
