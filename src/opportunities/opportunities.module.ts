import { Module } from '@nestjs/common';

import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesRepository } from './opportunities.repository';
import { OpportunitiesService } from './opportunities.service';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, OpportunitiesRepository, RolesGuard],
  exports: [OpportunitiesService, OpportunitiesRepository],
})
export class OpportunitiesModule {}