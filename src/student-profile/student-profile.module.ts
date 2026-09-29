import { Module } from '@nestjs/common';
import { StudentProfileController } from './student-profile.controller';
import { StudentProfileService } from './student-profile.service';
import { StudentProfileRepository } from './student-profile.repository';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [StudentProfileController],
  providers: [
    StudentProfileService,
    StudentProfileRepository,
    RolesGuard,
  ],
})
export class StudentProfileModule {}