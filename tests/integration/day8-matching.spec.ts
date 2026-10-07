import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import {
  OpportunityStatus,
  OpportunityType,
  SkillRequirementLevel,
  UserRole,
} from '@prisma/client';

import { AppModule } from '@/app.module';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';

import { AIQuestionService } from '@/assessments/ai-question.service';
import { AIApplicantAnalysisService } from '@/assessments/ai-applicant-analysis.service';

jest.setTimeout(30000);

describe('Day 8 AI Matching E2E Flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const studentUserId =
    '1ac59f6f-13f9-4088-b684-a00cb9ae1e53';

  let matchingOpportunityId: string | undefined;
  let lowerMatchingOpportunityId: string | undefined;
  let organizationId: string | undefined;

  let originalProfile: any;
  let originalStudentSkills: any[] = [];

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

    /*
     * Save the existing student's profile and skills
     * so the test can restore them after completion.
     */
    originalProfile =
      await prisma.studentProfile.findUnique({
        where: {
          userId: studentUserId,
        },
      });

    originalStudentSkills =
      await prisma.studentSkill.findMany({
        where: {
          studentProfileId: studentUserId,
        },
      });

    /*
     * Create or update the student's profile through
     * the real API.
     */
    const profileResponse =
      await request(app.getHttpServer())
        .post('/api/v1/students/profile')
        .set('x-test-user', 'student')
        .send({
          academicYear: 3,
          university: 'Addis Ababa University',
          fieldOfStudy: 'Computer Science',
          location: 'Addis Ababa',
          careerGoals: 'Become an AI engineer',
          careerGoalTags: ['AI'],
          interests: ['AI'],
          isDiscoverable: true,
        });

    /*
     * If the student already had a profile, POST may
     * reject the duplicate. In that case update it.
     */
    if (profileResponse.status !== 201) {
      const updateResponse =
        await request(app.getHttpServer())
          .patch('/api/v1/students/profile')
          .set('x-test-user', 'student')
          .send({
            academicYear: 3,
            university: 'Addis Ababa University',
            fieldOfStudy: 'Computer Science',
            location: 'Addis Ababa',
            careerGoals: 'Become an AI engineer',
            careerGoalTags: ['AI'],
            interests: ['AI'],
            isDiscoverable: true,
          });

      expect(updateResponse.status).toBe(200);
    }

    /*
     * Use deterministic student skills for the test.
     */
    const pythonSkill =
      await prisma.skill.upsert({
        where: {
          name: 'Python',
        },
        update: {},
        create: {
          name: 'Python',
          category: 'Programming',
          description:
            'Python programming language',
        },
      });

    const javaSkill =
      await prisma.skill.upsert({
        where: {
          name: 'Java',
        },
        update: {},
        create: {
          name: 'Java',
          category: 'Programming',
          description:
            'Java programming language',
        },
      });

    await prisma.studentSkill.deleteMany({
      where: {
        studentProfileId: studentUserId,
      },
    });

    await prisma.studentSkill.create({
      data: {
        studentProfileId: studentUserId,
        skillId: pythonSkill.id,
        proficiency: 4,
      },
    });

    /*
     * Create an approved organization so its published
     * opportunities are valid test data.
     */
    const organization =
      await prisma.organization.create({
        data: {
          name: `Day 8 Matching Organization ${Date.now()}`,
          verificationStatus: 'APPROVED',
        },
      });

    organizationId = organization.id;

    const deadline = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    /*
     * High-match opportunity:
     * - Python matches
     * - Computer Science matches
     * - AI interest matches
     * - Academic year matches
     * - Location matches
     */
    const matchingOpportunity =
      await prisma.opportunity.create({
        data: {
          organizationId: organization.id,
          title: 'Day8 AI Python Internship',
          description:
            'Python internship focused on AI development.',
          opportunityType:
            OpportunityType.INTERNSHIP,
          status: OpportunityStatus.PUBLISHED,
          location: 'Addis Ababa',
          isRemote: false,
          applicationDeadline: deadline,
          minimumAcademicYear: 3,
          maximumAcademicYear: 4,
          eligibleFields: ['Computer Science'],
          publishedAt: new Date(),
          skills: {
            create: {
              skillId: pythonSkill.id,
              requirementLevel:
                SkillRequirementLevel.REQUIRED,
            },
          },
        },
      });

    matchingOpportunityId =
      matchingOpportunity.id;

    /*
     * Lower-match opportunity:
     * - Java does not match
     * - Information Technology does not match
     * - Academic year does not match
     * - Location does not match
     * - No AI interest signal
     */
    const lowerMatchingOpportunity =
      await prisma.opportunity.create({
        data: {
          organizationId: organization.id,
          title: 'Day8 Java Internship',
          description:
            'Java internship for information technology students.',
          opportunityType:
            OpportunityType.INTERNSHIP,
          status: OpportunityStatus.PUBLISHED,
          location: 'Bahir Dar',
          isRemote: false,
          applicationDeadline: deadline,
          minimumAcademicYear: 4,
          maximumAcademicYear: 4,
          eligibleFields: [
            'Information Technology',
          ],
          publishedAt: new Date(),
          skills: {
            create: {
              skillId: javaSkill.id,
              requirementLevel:
                SkillRequirementLevel.REQUIRED,
            },
          },
        },
      });

    lowerMatchingOpportunityId =
      lowerMatchingOpportunity.id;
  });

  afterAll(async () => {
    /*
     * Remove only the test opportunities.
     */
    const opportunityIds = [
      matchingOpportunityId,
      lowerMatchingOpportunityId,
    ].filter(
      (id): id is string => Boolean(id),
    );

    if (opportunityIds.length > 0) {
      await prisma.opportunity.deleteMany({
        where: {
          id: {
            in: opportunityIds,
          },
        },
      });
    }

    /*
     * Restore the student's original skills.
     */
    await prisma.studentSkill.deleteMany({
      where: {
        studentProfileId: studentUserId,
      },
    });

    if (originalStudentSkills.length > 0) {
      await prisma.studentSkill.createMany({
        data: originalStudentSkills.map(
          (skill) => ({
            studentProfileId:
              skill.studentProfileId,
            skillId: skill.skillId,
            proficiency: skill.proficiency,
            yearsOfExperience:
              skill.yearsOfExperience,
          }),
        ),
      });
    }

    /*
     * Restore the original profile.
     */
    if (originalProfile) {
      await prisma.studentProfile.update({
        where: {
          userId: studentUserId,
        },
        data: {
          academicYear:
            originalProfile.academicYear,
          university:
            originalProfile.university,
          fieldOfStudy:
            originalProfile.fieldOfStudy,
          location:
            originalProfile.location,
          careerGoals:
            originalProfile.careerGoals,
          careerGoalTags:
            originalProfile.careerGoalTags,
          interests:
            originalProfile.interests,
          isDiscoverable:
            originalProfile.isDiscoverable,
        },
      });
    } else {
      await prisma.studentProfile.deleteMany({
        where: {
          userId: studentUserId,
        },
      });
    }

    /*
     * Delete the temporary organization after its
     * opportunities have been removed.
     */
    if (organizationId) {
      await prisma.organization.deleteMany({
        where: {
          id: organizationId,
        },
      });
    }

    await app.close();
  });

  it(
    'completes the student profile -> search -> matching -> ranking flow',
    async () => {
      /*
       * 1. Student profile can be retrieved.
       */
      const profileResponse =
        await request(app.getHttpServer())
          .get('/api/v1/students/profile')
          .set('x-test-user', 'student');

      expect(profileResponse.status).toBe(200);

      expect(profileResponse.body.userId).toBe(
        studentUserId,
      );

      expect(
        profileResponse.body.fieldOfStudy,
      ).toBe('Computer Science');

      /*
       * 2. Student searches/retrieves opportunities
       * through the recommendation endpoint.
       */
      const recommendationsResponse =
        await request(app.getHttpServer())
          .get(
            '/api/v1/students/recommendations?keyword=Day8',
          )
          .set('x-test-user', 'student');

      expect(
        recommendationsResponse.status,
      ).toBe(200);

      const recommendations =
        recommendationsResponse.body;

      expect(recommendations.length).toBe(2);

      /*
       * 3. Matching engine produces scores.
       */
      const matchingResult =
        recommendations.find(
          (result: any) =>
            result.opportunity.id ===
            matchingOpportunityId,
        );

      const lowerMatchingResult =
        recommendations.find(
          (result: any) =>
            result.opportunity.id ===
            lowerMatchingOpportunityId,
        );

      expect(matchingResult).toBeDefined();
      expect(lowerMatchingResult).toBeDefined();

      /*
       * 4. High-match opportunity receives full score.
       */
      expect(matchingResult.score).toBe(1);

      expect(
        matchingResult.matchedSkills,
      ).toContain('Python');

      expect(
        matchingResult.matchedInterests,
      ).toContain('AI');

      /*
       * 5. Lower-match opportunity receives a
       * lower score.
       */
      expect(
        lowerMatchingResult.score,
      ).toBeLessThan(
        matchingResult.score,
      );

      /*
       * 6. Results are ranked by score.
       */
      expect(
        recommendations[0].opportunity.id,
      ).toBe(matchingOpportunityId);
    },
  );
});