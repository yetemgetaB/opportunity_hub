import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { StudentProfileService } from './student-profile.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('students/profile')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentProfileController {
  constructor(
    private readonly studentProfileService: StudentProfileService,
  ) {}

  @Get()
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.studentProfileService.getMyProfile(userId);
  }

  @Post()
  async createMyProfile(
    @CurrentUser('id') userId: string,
    @Body() data: CreateStudentProfileDto,
  ) {
    return this.studentProfileService.createMyProfile(
      userId,
      data,
    );
  }

  @Patch()
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() data: UpdateStudentProfileDto,
  ) {
    return this.studentProfileService.updateMyProfile(
      userId,
      data,
    );
  }

  @Get('skills')
  async getMySkills(@CurrentUser('id') userId: string) {
    return this.studentProfileService.getMySkills(userId);
  }

  @Post('skills')
  async addSkill(
    @CurrentUser('id') userId: string,
    @Body() data: { skillId: string; proficiency?: number; yearsOfExperience?: number },
  ) {
    return this.studentProfileService.addSkill(userId, data);
  }

  @Post('skills/bulk')
  async setSkills(
    @CurrentUser('id') userId: string,
    @Body('skillIds') skillIds: string[],
  ) {
    return this.studentProfileService.setSkills(userId, skillIds ?? []);
  }

  @Delete('skills/:skillId')
  async removeSkill(
    @CurrentUser('id') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.studentProfileService.removeSkill(userId, skillId);
  }
}