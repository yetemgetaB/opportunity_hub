import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseHealthService } from './database.health.service';
import { DatabaseHealthController } from './database.health.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DatabaseHealthController],
  providers: [DatabaseHealthService],
  exports: [DatabaseHealthService],
})
export class DatabaseModule {}
