import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { RecommendationsService } from './recommendations.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get()
  getRecommendations() {
    return {
      message: 'Student recommendations endpoint is protected.',
      role: UserRole.STUDENT,
    };
  }
}