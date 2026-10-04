import { Module } from '@nestjs/common';

import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { UsersModule } from '@/users/users.module';
import { OpportunitiesModule } from '@/opportunities/opportunities.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [UsersModule, OpportunitiesModule],
  controllers: [VoiceController],
  providers: [VoiceService, RolesGuard],
  exports: [VoiceService],
})
export class VoiceModule {}