import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { RecommendationsModule } from './recommendations/recommendations.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { VoiceModule } from './voice/voice.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    RecommendationsModule,
    AssessmentsModule,
    VoiceModule,
    AdminModule,
  ],
})
export class AppModule {}