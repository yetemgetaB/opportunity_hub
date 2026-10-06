import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { AIApplicantAnalysisService } from '@/assessments/ai-applicant-analysis.service';
import { AIQuestionService } from '@/assessments/ai-question.service';
import { AssessmentsService } from '@/assessments/assessments.service';
import { AppModule } from '@/app.module';
import {
  OpportunityStatus,
  OpportunityType,
} from '@prisma/client';

const request = require('supertest');

jest.setTimeout(60000);

describe('Day 13 AI Applicant Analysis E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let assessmentsService: AssessmentsService;

  const organizationUserId =
    '2fc5e97d-e397-4a34-be5c-2f579062116d';

  const secondOrganizationUserId =
    '3c4aa7e5-8579-4358-ac38-f16e7ad3a65f';

  const studentUserId =
    'c2149a0c-e23d-42cd-8a5d-ad2893754d26';

  let createdOpportunityId: string | undefined;
  let createdApplicationId: string | undefined;
  let createdAssessmentId: string | undefined;
  let createdAttemptId: string | undefined;

  const mockAnalysis = {
    applicantId: studentUserId,
    applicationId: '',
    opportunityId: '',
    overallScore: 92,
    requirementMatch: 'HIGH',
    skillAnalysis: {
      matchedSkills: ['JavaScript', 'TypeScript'],
      missingSkills: [],
    },
    strengths: [
      'Strong technical skills relevant to the opportunity.',
      'Assessment answers demonstrate good understanding.',
    ],
    gaps: [
      'Limited documented professional experience.',
    ],
    summary:
      'The applicant demonstrates a strong match for the opportunity based on the provided profile, skills, experience, and assessment answers.',
  };

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

            const testUser =
              req.headers['x-test-user'];

            if (testUser === 'student') {
              req.user = {
                id: studentUserId,
              };

              return true;
            }

            if (testUser === 'organization') {
              req.user = {
                id: organizationUserId,
              };

              return true;
            }

            if (testUser === 'organization-b') {
              req.user = {
                id: secondOrganizationUserId,
              };

              return true;
            }

            return false;
          },
        })
        .overrideProvider(AIQuestionService)
        .useValue({
          generateQuestions: jest
            .fn()
            .mockResolvedValue({
              questions: [
                {
                  question:
                    'Explain how you would use JavaScript and TypeScript to build a reliable software feature.',
                },
                {
                  question:
                    'Describe a software project where you applied programming skills to solve a practical problem.',
                },
              ],
            }),
        })
        .overrideProvider(AIApplicantAnalysisService)
        .useValue({
          analyzeApplicant: jest
            .fn()
            .mockImplementation(async (input) => ({
              ...mockAnalysis,
              applicantId: input.applicantId,
              applicationId: input.applicationId,
              opportunityId: input.opportunityId,
            })),
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

    prisma =
      moduleFixture.get<PrismaService>(
        PrismaService,
      );

    assessmentsService =
      moduleFixture.get<AssessmentsService>(
        AssessmentsService,
      );
  });

  afterAll(async () => {
    /*
     * Delete the assessment attempt first because
     * Application has a foreign-key relationship to it.
     */
    if (createdAttemptId) {
      await prisma.assessmentResult.deleteMany({
        where: {
          assessmentAttemptId: createdAttemptId,
        },
      });

      await prisma.assessmentAnswer.deleteMany({
        where: {
          assessmentAttemptId: createdAttemptId,
        },
      });

      await prisma.assessmentAttempt.deleteMany({
        where: {
          id: createdAttemptId,
        },
      });
    }

    /*
     * Now the application can be safely deleted.
     */
    if (createdApplicationId) {
      await prisma.application.deleteMany({
        where: {
          id: createdApplicationId,
        },
      });
    }

    /*
     * Delete the assessment created for this test.
     */
    if (createdAssessmentId) {
      await prisma.assessment.deleteMany({
        where: {
          id: createdAssessmentId,
        },
      });
    }

    /*
     * Remove saved-opportunity references before
     * deleting the opportunity.
     */
    if (createdOpportunityId) {
      await prisma.savedOpportunity.deleteMany({
        where: {
          opportunityId: createdOpportunityId,
        },
      });

      await prisma.opportunity.deleteMany({
        where: {
          id: createdOpportunityId,
        },
      });
    }

    await app.close();
  });

  it(
    'should reject an unauthenticated applicant analysis request',
    async () => {
      const response = await request(
        app.getHttpServer(),
      ).post(
        '/api/v1/opportunities/00000000-0000-0000-0000-000000000000/applicants/00000000-0000-0000-0000-000000000000/analyze',
      );

      expect(response.status).toBe(403);
      expect(response.body).toBeDefined();
    },
  );

  it(
    'should reject a student from running applicant analysis',
    async () => {
      const opportunityId =
        '00000000-0000-0000-0000-000000000000';

      const applicationId =
        '00000000-0000-0000-0000-000000000000';

      const response = await request(
        app.getHttpServer(),
      )
        .post(
          `/api/v1/opportunities/${opportunityId}/applicants/${applicationId}/analyze`,
        )
        .set('x-test-user', 'student');

      expect(response.status).toBe(403);
    },
  );

  it(
    'should reject another organization from analyzing applicants for an opportunity it does not own',
    async () => {
      const opportunity =
        await prisma.opportunity.findFirst({
          where: {
            organization: {
              members: {
                some: {
                  userId: organizationUserId,
                },
              },
            },
          },
          select: {
            id: true,
          },
        });

      expect(opportunity).toBeDefined();

      const response = await request(
        app.getHttpServer(),
      )
        .post(
          `/api/v1/opportunities/${opportunity!.id}/applicants/00000000-0000-0000-0000-000000000000/analyze`,
        )
        .set('x-test-user', 'organization-b');

      expect(response.status).toBe(404);
    },
  );

  it(
    'should return 404 when the application does not exist',
    async () => {
      const opportunity =
        await prisma.opportunity.findFirst({
          where: {
            organization: {
              members: {
                some: {
                  userId: organizationUserId,
                },
              },
            },
          },
          select: {
            id: true,
          },
        });

      expect(opportunity).toBeDefined();

      const response = await request(
        app.getHttpServer(),
      )
        .post(
          `/api/v1/opportunities/${opportunity!.id}/applicants/00000000-0000-0000-0000-000000000000/analyze`,
        )
        .set('x-test-user', 'organization');

      expect(response.status).toBe(404);
    },
  );

  it(
    'should analyze a submitted applicant and persist the AI result',
    async () => {
      /*
       * 1. Find the organization that owns the
       * test opportunity.
       */
      const organization =
        await prisma.organization.findFirst({
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

      expect(organization).toBeDefined();

      /*
       * 2. Create a fresh opportunity directly
       * with Prisma.
       *
       * This follows the proven Day 10 setup.
       */
      const opportunity =
        await prisma.opportunity.create({
          data: {
            organization: {
              connect: {
                id: organization!.id,
              },
            },
            title: `Day 13 AI Analysis ${Date.now()}`,
            description:
              'Opportunity used to verify AI applicant analysis and result persistence.',
            opportunityType:
              OpportunityType.INTERNSHIP,
            status:
              OpportunityStatus.PUBLISHED,
            applicationDeadline: new Date(
              Date.now() +
                7 * 24 * 60 * 60 * 1000,
            ),
          },
          select: {
            id: true,
          },
        });

      createdOpportunityId =
        opportunity.id;

      expect(
        createdOpportunityId,
      ).toBeDefined();

      /*
       * 3. Create the student application
       * through the existing application API.
       */
      const applicationResponse =
        await request(
          app.getHttpServer(),
        )
          .post(
            `/api/v1/opportunities/${createdOpportunityId}/apply`,
          )
          .set(
            'x-test-user',
            'student',
          );

      expect(
        applicationResponse.status,
      ).toBe(201);

      createdApplicationId =
        applicationResponse.body.id;

      expect(
        createdApplicationId,
      ).toBeDefined();

      /*
       * 4. Organization creates an assessment.
       *
       * AIQuestionService is mocked, so this
       * test does not call Gemini.
       */
      const assessmentResponse =
        await request(
          app.getHttpServer(),
        )
          .post(
            `/api/v1/opportunities/${createdOpportunityId}/assessment`,
          )
          .set(
            'x-test-user',
            'organization',
          );

      expect(
        assessmentResponse.status,
      ).toBe(201);

      expect(
        assessmentResponse.body,
      ).toBeDefined();

      /*
       * 5. Read the generated assessment
       * and questions.
       */
      const assessment =
        await prisma.assessment.findUnique({
          where: {
            opportunityId:
              createdOpportunityId,
          },
          include: {
            questions: {
              orderBy: {
                questionOrder: 'asc',
              },
            },
          },
        });

      expect(assessment).toBeDefined();

      createdAssessmentId =
        assessment!.id;

      expect(
        assessment!.questions.length,
      ).toBeGreaterThan(0);

      /*
       * 6. Start the applicant's
       * assessment attempt.
       */
      const attempt =
        await assessmentsService.startAttempt({
          applicationId:
            createdApplicationId!,
          assessmentId:
            assessment!.id,
        });

      createdAttemptId =
        attempt.id;

      expect(attempt).toBeDefined();

      expect(
        attempt.applicationId,
      ).toBe(createdApplicationId);

      expect(
        attempt.assessmentId,
      ).toBe(assessment!.id);

      /*
       * 7. Save answers for every
       * generated question.
       */
      const answers =
        assessment!.questions.map(
          (question) => ({
            assessmentQuestionId:
              question.id,
            answerText:
              'I have practical experience with this topic and can explain how I would apply it in a real software project.',
          }),
        );

      const savedAnswers =
        await assessmentsService.saveAnswers(
          attempt.id,
          answers,
        );

      expect(
        savedAnswers,
      ).toBeDefined();

      /*
       * 8. Submit the assessment.
       */
      const submittedAttempt =
        await assessmentsService.submitAttempt(
          attempt.id,
        );

      expect(
        submittedAttempt.status,
      ).toBe('SUBMITTED');

      /*
       * 9. Organization runs
       * applicant analysis.
       */
      const analysisResponse =
        await request(
          app.getHttpServer(),
        )
          .post(
            `/api/v1/opportunities/${createdOpportunityId}/applicants/${createdApplicationId}/analyze`,
          )
          .set(
            'x-test-user',
            'organization',
          );

      expect(
        analysisResponse.status,
      ).toBe(201);

      expect(
        analysisResponse.body,
      ).toBeDefined();

      expect(
        analysisResponse.body.applicationId,
      ).toBe(createdApplicationId);

      expect(
        analysisResponse.body.opportunityId,
      ).toBe(createdOpportunityId);

      /*
       * 10. Verify the AI analysis result.
       */
      expect(
        analysisResponse.body.analysis
          .overallScore,
      ).toBe(92);

      expect(
        analysisResponse.body.analysis
          .requirementMatch,
      ).toBe('HIGH');

      expect(
        analysisResponse.body.analysis
          .strengths,
      ).toHaveLength(2);

      expect(
        analysisResponse.body.analysis
          .gaps,
      ).toHaveLength(1);

      expect(
        analysisResponse.body.analysis
          .summary,
      ).toBe(mockAnalysis.summary);

      /*
       * 11. Verify AssessmentResult
       * persistence.
       */
      const savedResult =
        await prisma.assessmentResult.findUnique({
          where: {
            assessmentAttemptId:
              attempt.id,
          },
        });

      expect(savedResult).toBeDefined();

      expect(
        savedResult!.aiScore,
      ).toBe(92);

      expect(
        savedResult!.aiRequirementMatch,
      ).toBe('HIGH');

      expect(
        savedResult!.aiStrengths,
      ).toEqual(
        expect.arrayContaining([
          'Strong technical skills relevant to the opportunity.',
          'Assessment answers demonstrate good understanding.',
        ]),
      );

      expect(
        savedResult!.aiGaps,
      ).toEqual(
        expect.arrayContaining([
          'Limited documented professional experience.',
        ]),
      );

      expect(
        savedResult!.aiSummary,
      ).toBe(mockAnalysis.summary);

      expect(
        savedResult!.aiEvaluatedAt,
      ).toBeDefined();
    },
    60000,
  );
});
