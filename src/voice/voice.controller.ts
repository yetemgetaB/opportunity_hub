import { Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { VoiceService } from './voice.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('search')
  searchByVoice() {
    return {
      message: 'Student voice search endpoint is protected.',
      role: UserRole.STUDENT,
    };
  }
}