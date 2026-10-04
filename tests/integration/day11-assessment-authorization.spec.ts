import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');

import { AppModule } from '@/app.module';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';

jest.setTimeout(30000);

describe('Day 11 Assessment Authorization E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const organizationUserId =
    '2fc5e97d-e397-4a34-be5c-2f579062116d';

  const secondOrganizationUserId =
    '3c4aa7e5-8579-4358-ac38-f16e7ad3a65f';

  const studentUserId =
    'c2149a0c-e23d-42cd-8a5d-ad2893754d26';

  let opportunityId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(SupabaseAuthGuard)
        .useValue({
          canActivate: (context: any) => {
            const request =
              context.switchToHttp().getRequest();

            const testUser =
              request.headers['x-test-user'];

            if (testUser === 'organization') {
              request.user = {
                id: organizationUserId,
              };

              return true;
            }

            if (testUser === 'organization-b') {
              request.user = {
                id: secondOrganizationUserId,
              };

              return true;
            }

            if (testUser === 'student') {
              request.user = {
                id: studentUserId,
              };

              return true;
            }

            return false;
          },
        })
        .compile();

    app = moduleFixture.createNestApplication();

    prisma = moduleFixture.get<PrismaService>(
      PrismaService,
    );

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const organizationB =
      await prisma.organization.upsert({
        where: {
          name: 'Authorization Test Organization B',
        },
        update: {},
        create: {
          name: 'Authorization Test Organization B',
        },
      });

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organizationB.id,
          userId: secondOrganizationUserId,
        },
      },
      update: {},
      create: {
        organizationId: organizationB.id,
        userId: secondOrganizationUserId,
      },
    });

    const createOpportunityResponse =
      await request(app.getHttpServer())
        .post('/api/v1/opportunities')
        .set('x-test-user', 'organization')
        .send({
          title:
            'Day 11 Assessment Authorization Opportunity',
          description:
            'Opportunity used to verify assessment authorization.',
          opportunityType: 'INTERNSHIP',
          location: 'Addis Ababa',
          isRemote: false,
          eligibleFields: ['Computer Science'],
          minimumAcademicYear: 3,
          minimumGpa: 2.5,
        });

    expect(createOpportunityResponse.status).toBe(201);

    opportunityId =
      createOpportunityResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject an unauthenticated request to create an assessment', async () => {
    const response = await request(
      app.getHttpServer(),
    ).post(
      `/api/v1/opportunities/${opportunityId}/assessment`,
    );

    expect(response.status).toBe(403);
  });

  it('should reject a student from creating an assessment', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post(
        `/api/v1/opportunities/${opportunityId}/assessment`,
      )
      .set('x-test-user', 'student');

    expect(response.status).toBe(403);
  });

  it('should allow the owning organization to create an assessment', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post(
        `/api/v1/opportunities/${opportunityId}/assessment`,
      )
      .set('x-test-user', 'organization');

    expect(response.status).toBe(201);

    expect(response.body).toBeDefined();
    expect(response.body.opportunityId).toBe(
      opportunityId,
    );
  });

  it('should reject another organization from creating an assessment for an opportunity it does not own', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post(
        `/api/v1/opportunities/${opportunityId}/assessment`,
      )
      .set('x-test-user', 'organization-b');

    expect(response.status).toBe(403);
  });

  it('should reject an invalid opportunity id', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post(
        '/api/v1/opportunities/00000000-0000-0000-0000-000000000000/assessment',
      )
      .set('x-test-user', 'organization');

    expect(response.status).toBe(404);
  });
});

