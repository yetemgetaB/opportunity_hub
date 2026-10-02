import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ApplicationsRepository } from './applications.repository';
import { ApplicationsService } from './applications.service';

@Module({
  imports: [PrismaModule],
  providers: [ApplicationsRepository, ApplicationsService],
  exports: [ApplicationsRepository, ApplicationsService],
})
export class ApplicationsModule {}
