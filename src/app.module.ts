import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import databaseConfig from './config/database.config';
import aiConfig from './config/ai.config';

import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './database/database.module';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentProfileModule } from './student-profile/student-profile.module';

import { RecommendationsModule } from './recommendations/recommendations.module';
import { AssessmentsModule } from './assessments/assessments.module';

import { VoiceModule } from './voice/voice.module';
import { AdminModule } from './admin/admin.module';

import { OpportunitiesModule } from './opportunities/opportunities.module';
import { OrganizationProfileModule } from './organization-profile/organization-profile.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, aiConfig],
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

    OpportunitiesModule,

    StudentProfileModule,

    OrganizationProfileModule,

    ApplicationsModule,
  ],
})
export class AppModule {}