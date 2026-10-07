import { Module } from '@nestjs/common';

import { StudentProfileController } from './student-profile.controller';
import { StudentProfileService } from './student-profile.service';
import { StudentProfileRepository } from './student-profile.repository';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { CvsRepository } from './cvs.repository';
import { CvStorageService } from './cv-storage.service';
import { CvTextExtractorService } from './cv-text-extractor.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [StudentProfileController, CvsController],
  providers: [
    StudentProfileService,
    StudentProfileRepository,
    CvsService,
    CvsRepository,
    CvStorageService,
    CvTextExtractorService,
    RolesGuard,
  ],
  exports: [
    StudentProfileRepository,
    CvsService,
    CvsRepository,
    CvStorageService,
    CvTextExtractorService,
  ],
})
export class StudentProfileModule {}