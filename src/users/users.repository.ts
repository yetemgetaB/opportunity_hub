import {
  Injectable,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

import {
  CreateUserData,
  UserLookupResult,
  UserRoleResult,
} from './users.interface';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(
    UsersRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

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

  async findRoleByAuthId(
    authUserId: string,
  ): Promise<UserRoleResult | null> {
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

  async create(data: CreateUserData): Promise<User> {
    try {
      const newUser =
        await this.prisma.user.create({
          data: {
            id: data.id,
            firstName: data.firstName.trim(),
            middleName: data.middleName
              ? data.middleName.trim()
              : null,
            lastName: data.lastName.trim(),
            role: data.role,
            avatarUrl: data.avatarUrl || null,
            isActive:
              data.isActive !== undefined
                ? data.isActive
                : true,
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

  async createOrganizationAccount(
    data: CreateUserData,
    organizationName: string,
  ): Promise<User> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const newUser =
            await tx.user.create({
              data: {
                id: data.id,
                firstName: data.firstName.trim(),
                middleName: data.middleName
                  ? data.middleName.trim()
                  : null,
                lastName: data.lastName.trim(),
                role: data.role,
                avatarUrl: data.avatarUrl || null,
                isActive:
                  data.isActive !== undefined
                    ? data.isActive
                    : true,
              },
            });

          const organization =
            await tx.organization.create({
              data: {
                name: organizationName.trim(),
              },
            });

          await tx.organizationMember.create({
            data: {
              organizationId: organization.id,
              userId: newUser.id,
            },
          });

          this.logger.log(
            `Created organization account for user ${newUser.id} with organization ${organization.id}`,
          );

          return newUser;
        },
      );
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'An application user or organization with the same unique value already exists.',
        );
      }

      throw error;
    }
  }

  async existsAndActive(
    id: string,
  ): Promise<boolean> {
    const user =
      await this.prisma.user.findFirst({
        where: {
          id,
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

    return !!user;
  }

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