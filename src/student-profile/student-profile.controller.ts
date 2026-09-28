import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/guards/supabase-auth.guard';
import { StudentProfileService } from './student-profile.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('students/profile')
@UseGuards(SupabaseAuthGuard)
export class StudentProfileController {
  constructor(
    private readonly studentProfileService: StudentProfileService,
  ) {}

  @Get()
  async getMyProfile(@Req() request: AuthenticatedRequest) {
    return this.studentProfileService.getMyProfile(
      request.user.id,
    );
  }

  @Post()
  async createMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() data: CreateStudentProfileDto,
  ) {
    return this.studentProfileService.createMyProfile(
      request.user.id,
      data,
    );
  }

  @Patch()
  async updateMyProfile(
  @Req() request: AuthenticatedRequest,
  @Body() data: UpdateStudentProfileDto,
) {
  return this.studentProfileService.updateMyProfile(
    request.user.id,
    data,
  );
}
}