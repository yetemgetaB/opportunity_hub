import { Module } from '@nestjs/common';
import { StudentProfileController } from './student-profile.controller';
import { StudentProfileService } from './student-profile.service';
import { StudentProfileRepository } from './student-profile.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentProfileController],
  providers: [
    StudentProfileService,
    StudentProfileRepository,
  ],
})
export class StudentProfileModule {}