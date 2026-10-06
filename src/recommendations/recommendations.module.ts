import { Module } from '@nestjs/common';

import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { StudentProfileModule } from '@/student-profile/student-profile.module';
import { OpportunitiesModule } from '@/opportunities/opportunities.module';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [
    StudentProfileModule,
    OpportunitiesModule,
    UsersModule,
  ],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    RolesGuard,
  ],
  exports: [
    RecommendationsService,
  ],
})
export class RecommendationsModule {}