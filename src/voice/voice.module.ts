import { Module } from '@nestjs/common';

import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { VoiceSearchCriteriaService } from './voice-search-criteria.service';
import { UsersModule } from '@/users/users.module';
import { RecommendationsModule } from '@/recommendations/recommendations.module';
import { StudentProfileModule } from '@/student-profile/student-profile.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    RecommendationsModule,
    StudentProfileModule,
  ],
  controllers: [VoiceController],
  providers: [
    VoiceService,
    VoiceSearchCriteriaService,
    RolesGuard,
  ],
})
export class VoiceModule {}