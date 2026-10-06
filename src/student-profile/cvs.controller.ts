import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';

import { CvsService } from './cvs.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { CvResponseDto } from './dto/cv-response.dto';

@Controller('students/profile')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  /**
   * Upload a new CV file (PDF or DOCX).
   */
  @Post('cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('isDefault') isDefaultQuery?: string,
  ): Promise<CvResponseDto> {
    const isDefault =
      isDefaultQuery === 'true' || isDefaultQuery === '1';
    return this.cvsService.uploadCv(userId, file, isDefault);
  }

  /**
   * List all CVs belonging to the authenticated student.
   */
  @Get('cvs')
  async getMyCvs(
    @CurrentUser('id') userId: string,
  ): Promise<CvResponseDto[]> {
    return this.cvsService.getStudentCvs(userId);
  }

  /**
   * Set a specific CV as default.
   */
  @Patch('cvs/:id/default')
  async setDefaultCv(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CvResponseDto> {
    return this.cvsService.setDefaultCv(userId, id);
  }

  /**
   * Obtain a temporary signed download URL for the student's own CV.
   */
  @Get('cvs/:id/download')
  async getDownloadUrl(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.cvsService.getDownloadUrl(userId, id);
  }

  /**
   * Delete a CV record and its underlying storage object.
   */
  @Delete('cvs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCv(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.cvsService.deleteCv(userId, id);
  }
}
