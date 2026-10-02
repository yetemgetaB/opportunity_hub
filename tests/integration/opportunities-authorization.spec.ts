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

describe('Opportunity Authorization E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const organizationUserId =
    '2fc5e97d-e397-4a34-be5c-2f579062116d';

  const secondOrganizationUserId =
    '3c4aa7e5-8579-4358-ac38-f16e7ad3a65f';

  const studentUserId =
    'c2149a0c-e23d-42cd-8a5d-ad2893754d26';

  let organizationAOpportunityId: string;

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

    // Create a second organization for ownership testing.
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject an unauthenticated request', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post('/api/v1/opportunities')
      .set('x-test-user', 'invalid');

    expect(response.status).toBe(403);
  });

  it('should reject a student from creating an opportunity', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post('/api/v1/opportunities')
      .set('x-test-user', 'student')
      .send({
        title: 'Student Test Opportunity',
        description:
          'This opportunity should not be created by a student.',
        opportunityType: 'INTERNSHIP',
      });

    expect(response.status).toBe(403);
  });

  it('should allow an organization to create an opportunity', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post('/api/v1/opportunities')
      .set('x-test-user', 'organization')
      .send({
        title: 'Backend Developer Internship',
        description:
          'A test internship opportunity for backend development students.',
        opportunityType: 'INTERNSHIP',
        location: 'Addis Ababa',
        isRemote: false,
        eligibleFields: ['Computer Science'],
        minimumAcademicYear: 3,
        minimumGpa: 2.5,
      });

    expect(response.status).toBe(201);

    expect(response.body.organizationId).toBe(
      '537d2b61-ae27-4ed1-a956-71a7ed241859',
    );

    expect(response.body.title).toBe(
      'Backend Developer Internship',
    );

    expect(response.body.opportunityType).toBe(
      'INTERNSHIP',
    );

    organizationAOpportunityId =
      response.body.id;
  });

  it('should allow the owning organization to update its opportunity', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .patch(
        `/api/v1/opportunities/${organizationAOpportunityId}`,
      )
      .set('x-test-user', 'organization')
      .send({
        title: 'Updated Backend Developer Internship',
      });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      'Opportunity updated successfully.',
    );
  });

  it('should reject another organization from updating the opportunity', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .patch(
        `/api/v1/opportunities/${organizationAOpportunityId}`,
      )
      .set('x-test-user', 'organization-b')
      .send({
        title: 'Unauthorized Update Attempt',
      });

    expect(response.status).toBe(403);
  });
});