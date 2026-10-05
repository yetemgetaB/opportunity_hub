import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { VoiceService } from './voice.service';
import { VoiceSearchDto } from './dto/voice-search.dto';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('search')
  searchByVoice(
    @CurrentUser('id') userId: string,
    @Body() query: VoiceSearchDto,
  ) {
    return this.voiceService.searchByVoice(userId, query);
  }
}