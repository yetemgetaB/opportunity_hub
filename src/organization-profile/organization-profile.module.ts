import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';
import { OrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileRepository } from './organization-profile.repository';
import { OrganizationProfileService } from './organization-profile.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [OrganizationProfileController],
  providers: [
    OrganizationProfileService,
    OrganizationProfileRepository,
    RolesGuard,
  ],
})
export class OrganizationProfileModule {}