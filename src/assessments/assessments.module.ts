import { Module } from '@nestjs/common';

import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { AIQuestionService } from './ai-question.service';

import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '@/users/users.module';
import { OrganizationProfileModule } from '@/organization-profile/organization-profile.module';
import { OpportunitiesModule } from '@/opportunities/opportunities.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    OrganizationProfileModule,
    OpportunitiesModule,
  ],
  controllers: [AssessmentsController],
  providers: [
    AssessmentsRepository,
    AssessmentsService,
    AIQuestionService,
    RolesGuard,
  ],
  exports: [
    AssessmentsRepository,
    AssessmentsService,
    AIQuestionService,
  ],
})
export class AssessmentsModule {}