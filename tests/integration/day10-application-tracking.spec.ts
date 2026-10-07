import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AppModule } from '../../src/app.module';
import { SupabaseAuthGuard } from '../../src/auth/guards/supabase-auth.guard';
import {
  ApplicationStatus,
  OpportunityStatus,
  OpportunityType,
} from '@prisma/client';

import { AIQuestionService } from '../../src/assessments/ai-question.service';
import { AIApplicantAnalysisService } from '../../src/assessments/ai-applicant-analysis.service';

const request = require('supertest');

jest.setTimeout(30000);

describe('Day 10 - Application Tracking & Authorization', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const studentUserId =
    '1ac59f6f-13f9-4088-b684-a00cb9ae1e53';

  const organizationUserId =
    '2fc5e97d-e397-4a34-be5c-2f579062116d';

  const secondOrganizationUserId =
    '3c4aa7e5-8579-4358-ac38-f16e7ad3a65f';

  let secondStudentUserId: string;
  let opportunityId: string;
  let applicationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(SupabaseAuthGuard)
        .useValue({
          canActivate: (context: any) => {
            const request = context.switchToHttp().getRequest();
            const testUser = request.headers['x-test-user'];

            if (testUser === 'student') {
              request.user = { id: studentUserId };
              return true;
            }

            if (testUser === 'student-b') {
              request.user = { id: secondStudentUserId };
              return true;
            }

            if (testUser === 'organization') {
              request.user = { id: organizationUserId };
              return true;
            }

            if (testUser === 'organization-b') {
              request.user = { id: secondOrganizationUserId };
              return true;
            }

            return false;
          },
        })
        .overrideProvider(AIQuestionService)
        .useValue({
          generateQuestions: jest.fn(),
        })
        .overrideProvider(AIApplicantAnalysisService)
        .useValue({
          analyzeApplicant: jest.fn(),
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
        'Day 10 test requires at least two student profiles.',
      );
    }

    secondStudentUserId = secondStudent.userId;

    const organization = await prisma.organization.findFirst({
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

    if (!organization) {
      throw new Error(
        'Organization for Day 10 test was not found.',
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        organization: {
          connect: {
            id: organization.id,
          },
        },
        title: `Day 10 Application Tracking ${Date.now()}`,
        description:
          'Temporary opportunity for Day 10 Backend 3 integration testing.',
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

  describe('Student application tracking', () => {
    it('allows a student to apply and starts at SUBMITTED status', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/opportunities/${opportunityId}/apply`)
        .set('x-test-user', 'student');

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe(ApplicationStatus.SUBMITTED);

      applicationId = response.body.id;
    });

    it('allows the student to view their application status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/opportunities/applications')
        .set('x-test-user', 'student');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const application = response.body.find(
        (item: any) => item.id === applicationId,
      );

      expect(application).toBeDefined();
      expect(application.status).toBe(ApplicationStatus.SUBMITTED);
      expect(application.opportunityId).toBe(opportunityId);
    });

    it('does not expose Student A application to Student B', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/opportunities/applications')
        .set('x-test-user', 'student-b');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const otherStudentApplication = response.body.find(
        (item: any) => item.id === applicationId,
      );

      expect(otherStudentApplication).toBeUndefined();
    });
  });

  describe('Status authorization', () => {
    it('prevents a student from updating application status', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/api/v1/opportunities/${opportunityId}/applications/${applicationId}/status`,
        )
        .set('x-test-user', 'student')
        .send({
          status: ApplicationStatus.SHORTLISTED,
        });

      expect(response.status).toBe(403);
    });

    it('allows the owning organization to update application status', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/api/v1/opportunities/${opportunityId}/applications/${applicationId}/status`,
        )
        .set('x-test-user', 'organization')
        .send({
          status: ApplicationStatus.SHORTLISTED,
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(applicationId);
      expect(response.body.status).toBe(ApplicationStatus.SHORTLISTED);
    });

    it('prevents another organization from updating the application', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/api/v1/opportunities/${opportunityId}/applications/${applicationId}/status`,
        )
        .set('x-test-user', 'organization-b')
        .send({
          status: ApplicationStatus.ACCEPTED,
        });

      expect([403, 404]).toContain(response.status);
    });

    it('rejects an invalid application status', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/api/v1/opportunities/${opportunityId}/applications/${applicationId}/status`,
        )
        .set('x-test-user', 'organization')
        .send({
          status: 'INVALID_STATUS',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Student tracking after organization update', () => {
    it('shows SHORTLISTED status to the student after organization update', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/opportunities/applications')
        .set('x-test-user', 'student');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const application = response.body.find(
        (item: any) => item.id === applicationId,
      );

      expect(application).toBeDefined();
      expect(application.status).toBe(
        ApplicationStatus.SHORTLISTED,
      );
    });
  });

  describe('Application database relationship', () => {
    it('keeps the correct student, opportunity, organization, and status relationship', async () => {
      const application = await prisma.application.findUnique({
        where: {
          id: applicationId,
        },
        include: {
          opportunity: {
            include: {
              organization: true,
            },
          },
          studentProfile: true,
        },
      });

      expect(application).toBeDefined();
      expect(application?.studentProfileId).toBe(studentUserId);
      expect(application?.studentProfile.userId).toBe(studentUserId);
      expect(application?.opportunityId).toBe(opportunityId);
      expect(application?.opportunity.id).toBe(opportunityId);
      expect(application?.opportunity.organization).toBeDefined();
      expect(application?.status).toBe(ApplicationStatus.SHORTLISTED);
    });
  });
});

