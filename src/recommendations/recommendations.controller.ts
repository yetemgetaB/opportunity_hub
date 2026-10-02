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
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('students/recommendations')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  async getRecommendations(
    @CurrentUser('id') userId: string,
  ) {
    return this.recommendationsService.getRecommendations(userId);
  }
}