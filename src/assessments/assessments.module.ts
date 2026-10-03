import { Module } from '@nestjs/common';

import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';

import { UsersModule } from '@/users/users.module';
import { OrganizationProfileModule } from '@/organization-profile/organization-profile.module';
import { OpportunitiesModule } from '@/opportunities/opportunities.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    OrganizationProfileModule,
    OpportunitiesModule,
  ],
  controllers: [AssessmentsController],
  providers: [
    AssessmentsService,
    AssessmentsRepository,
    RolesGuard,
  ],
})
export class AssessmentsModule {}