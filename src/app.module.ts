import { Module } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

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
import { NotificationsModule } from './notifications/notifications.module';
import { SkillsModule } from './skills/skills.module';

const frontendDist = existsSync(join(process.cwd(), 'frontend', 'dist'))
  ? join(process.cwd(), 'frontend', 'dist')
  : join(__dirname, '..', 'frontend', 'dist');

@Module({
  imports: [
    ...(existsSync(frontendDist)
      ? [
          ServeStaticModule.forRoot({
            rootPath: frontendDist,
            exclude: ['/api/(.*)'],
          }),
        ]
      : []),
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
    NotificationsModule,
    SkillsModule,
  ],
})
export class AppModule {}

