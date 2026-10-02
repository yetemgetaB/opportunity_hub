import { Module } from '@nestjs/common';

import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesRepository } from './opportunities.repository';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [OpportunitiesController],
  providers: [
    OpportunitiesService,
    OpportunitiesRepository,
    RolesGuard,
  ],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}