import { Module } from '@nestjs/common';

import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';

import { AIQuestionService } from './ai-question.service';
import { AIApplicantAnalysisService } from './ai-applicant-analysis.service';

import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '@/users/users.module';
import { OrganizationProfileModule } from '@/organization-profile/organization-profile.module';
import { OpportunitiesModule } from '@/opportunities/opportunities.module';
import { StudentProfileModule } from '@/student-profile/student-profile.module';
import { RolesGuard } from '@/common/guards/roles.guard';

import { ApplicationsModule } from '@/applications/applications.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [
  PrismaModule,
  UsersModule,
  OrganizationProfileModule,
  OpportunitiesModule,
  StudentProfileModule,
  ApplicationsModule,
  NotificationsModule,
],
  controllers: [AssessmentsController],
  providers: [
    AssessmentsRepository,
    AssessmentsService,
    AIQuestionService,
    AIApplicantAnalysisService,
    RolesGuard,
  ],
  exports: [
    AssessmentsRepository,
    AssessmentsService,
    AIQuestionService,
    AIApplicantAnalysisService,
  ],
})
export class AssessmentsModule {}