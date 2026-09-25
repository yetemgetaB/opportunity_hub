import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, SupabaseAuthGuard],
  exports: [UsersRepository, UsersService, SupabaseAuthGuard],
})
export class UsersModule {}
