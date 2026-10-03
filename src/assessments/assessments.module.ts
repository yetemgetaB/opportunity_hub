import { Module } from '@nestjs/common';

import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsRepository, AssessmentsService, RolesGuard],
  exports: [AssessmentsRepository, AssessmentsService],
})
export class AssessmentsModule {}