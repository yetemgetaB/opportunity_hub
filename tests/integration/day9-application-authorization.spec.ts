import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AppModule } from '../../src/app.module';
import { SupabaseAuthGuard } from '../../src/auth/guards/supabase-auth.guard';
import { OpportunityStatus, OpportunityType } from '@prisma/client';

const request = require('supertest');

jest.setTimeout(30000);

describe('Day 9 - Application Authorization & Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const studentUserId =
    '1ac59f6f-13f9-4088-b684-a00cb9ae1e53';

  const organizationUserId =
    '2fc5e97d-e397-4a34-be5c-2f579062116d';

  let secondStudentUserId: string;
  let opportunityId: string;
  let applicationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          const testUser = req.headers['x-test-user'];

          if (testUser === 'student') {
            req.user = { id: studentUserId };
            return true;
          }

          if (testUser === 'student-b') {
            req.user = { id: secondStudentUserId };
            return true;
          }

          if (testUser === 'organization') {
            req.user = { id: organizationUserId };
            return true;
          }

          return false;
        },
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

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Find another existing student dynamically.
    const secondStudent = await prisma.studentProfile.findFirst({
      where: {
        userId: {
          not: studentUserId,
        },
      },
      select: {
        userId: true,
      },
    });

    if (!secondStudent) {
      throw new Error(
        'Day 9 test requires at least two student profiles in the database.',
      );
    }

    secondStudentUserId = secondStudent.userId;

    // Find the existing organization belonging to the organization user.
    const testOrganization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: organizationUserId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!testOrganization) {
      throw new Error(
        'Organization for Day 9 application test was not found.',
      );
    }

    // Create a temporary published opportunity.
    const opportunity = await prisma.opportunity.create({
      data: {
        organization: {
          connect: {
            id: testOrganization.id,
          },
        },
        title: `Day 9 Application Test ${Date.now()}`,
        description: 'Temporary opportunity for Day 9 Backend 3 testing.',
        opportunityType: OpportunityType.INTERNSHIP,
        status: OpportunityStatus.PUBLISHED,
        applicationDeadline: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
      select: {
        id: true,
      },
    });

    opportunityId = opportunity.id;
  });

  afterAll(async () => {
    if (applicationId) {
      await prisma.application.deleteMany({
        where: {
          id: applicationId,
        },
      });
    }

    if (opportunityId) {
      await prisma.savedOpportunity.deleteMany({
        where: {
          opportunityId,
        },
      });

      await prisma.opportunity.deleteMany({
        where: {
          id: opportunityId,
        },
      });
    }

    await app.close();
  });

  describe('Student authorization', () => {
    it('allows a student to save an opportunity', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/opportunities/${opportunityId}/save`)
        .set('x-test-user', 'student');

      expect(response.status).toBe(201);
    });

    it('allows a student to remove a saved opportunity', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/opportunities/${opportunityId}/save`)
        .set('x-test-user', 'student');

      expect([200, 204]).toContain(response.status);
    });

    it('allows a student to apply to an opportunity', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/opportunities/${opportunityId}/apply`)
        .set('x-test-user', 'student');

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();

      applicationId = response.body.id;
    });

    it('prevents the same student from applying twice', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/opportunities/${opportunityId}/apply`)
        .set('x-test-user', 'student');

      expect(response.status).toBe(409);
    });

    it('allows the student to view their own applications', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/opportunities/applications')
        .set('x-test-user', 'student');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const ownApplication = response.body.find(
        (application: any) => application.id === applicationId,
      );

      expect(ownApplication).toBeDefined();
      expect(ownApplication.opportunityId).toBe(opportunityId);
    });
  });

  describe('Role authorization', () => {
    it('prevents an organization user from applying', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/opportunities/${opportunityId}/apply`)
        .set('x-test-user', 'organization');

      expect(response.status).toBe(403);
    });
  });

  describe('Application ownership', () => {
    it('does not expose Student A application in Student B application list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/opportunities/applications')
        .set('x-test-user', 'student-b');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const otherStudentApplication = response.body.find(
        (application: any) => application.id === applicationId,
      );

      expect(otherStudentApplication).toBeUndefined();
    });
  });

  describe('Application database relationship', () => {
    it('stores the application with the correct student and opportunity', async () => {
      expect(applicationId).toBeDefined();

      const application = await prisma.application.findUnique({
        where: {
          id: applicationId,
        },
        include: {
          opportunity: true,
          studentProfile: true,
        },
      });

      expect(application).toBeDefined();
      expect(application?.studentProfileId).toBe(studentUserId);
      expect(application?.opportunityId).toBe(opportunityId);
      expect(application?.opportunity.id).toBe(opportunityId);
      expect(application?.studentProfile.userId).toBe(studentUserId);
    });
  });
});

