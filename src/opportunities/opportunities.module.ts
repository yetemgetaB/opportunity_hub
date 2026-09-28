import { Module } from '@nestjs/common';

import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [UsersModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, RolesGuard],
})
export class OpportunitiesModule {}