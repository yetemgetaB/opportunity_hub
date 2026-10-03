import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');

import { AppModule } from '@/app.module';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('Organization Profile E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(SupabaseAuthGuard)
        .useValue({
          canActivate: (context: any) => {
            const req =
              context.switchToHttp().getRequest();

            req.user = {
              id: '22222222-2222-2222-2222-222222222222',
            };

            return true;
          },
        })
        .overrideGuard(RolesGuard)
        .useValue({
          canActivate: () => true,
        })
        .compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reach the organization profile endpoint for an authenticated organization user', async () => {
    const response = await request(
      app.getHttpServer(),
    ).get('/api/v1/organizations/profile');

    expect([200, 404]).toContain(response.status);
  });

  it('should reject an invalid update payload', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .patch('/api/v1/organizations/profile')
      .send({
        verificationStatus: 'VERIFIED',
      });

    expect(response.status).toBe(400);
  });
});