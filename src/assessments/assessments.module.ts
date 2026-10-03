import { Module } from '@nestjs/common';

import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';

@Module({
  imports: [UsersModule],
  controllers: [AssessmentsController],
  providers: [
    AssessmentsService,
    AssessmentsRepository,
    RolesGuard,
  ],
})
export class AssessmentsModule {}