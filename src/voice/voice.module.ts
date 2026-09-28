import { Module } from '@nestjs/common';

import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [UsersModule],
  controllers: [VoiceController],
  providers: [VoiceService, RolesGuard],
})
export class VoiceModule {}