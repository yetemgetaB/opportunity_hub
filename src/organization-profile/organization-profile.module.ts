import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileRepository } from './organization-profile.repository';
import { OrganizationProfileService } from './organization-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationProfileController],
  providers: [
    OrganizationProfileService,
    OrganizationProfileRepository,
  ],
})
export class OrganizationProfileModule {}