import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  AssessmentQuestionType,
  AssessmentStatus,
} from '@prisma/client';

import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';
import { AIQuestionService } from './ai-question.service';
import { AIApplicantAnalysisService } from './ai-applicant-analysis.service';
import { CvsService } from '@/student-profile/cvs.service';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  const mockAssessmentsRepository = {
    create: jest.fn(),
    getAssessment: jest.fn(),
    getAssessmentQuestions: jest.fn(),
    update: jest.fn(),

    createAttempt: jest.fn(),
    findAttemptById: jest.fn(),
    findAttemptByIdWithAnswers: jest.fn(),
    findAttemptByApplicationId: jest.fn(),

    submitAttempt: jest.fn(),

    findSubmittedAttemptsByAssessmentId: jest.fn(),
    findSubmittedAttemptsByOpportunityId: jest.fn(),

    saveAnswer: jest.fn(),
    saveAnswers: jest.fn(),
    findAnswersByAttemptId: jest.fn(),

    getApplicantAnalysisData: jest.fn(),
    getSubmittedApplicantAnalysisData: jest.fn(),
    findEligibleApplicantsForAnalysis: jest.fn(),

    saveAssessmentResult: jest.fn(),
    findAssessmentResultById: jest.fn(),
    findAssessmentResultByAttemptId: jest.fn(),
    findAssessmentResultByApplicationId: jest.fn(),
    findAssessmentResultsByOpportunityId: jest.fn(),
  };

  const mockOrganizationProfileRepository = {
    findByUserId: jest.fn(),
  };

  const mockOpportunitiesRepository = {
    findById: jest.fn(),
    findByIdAndOrganizationId: jest.fn(),
  };

  const mockAIQuestionService = {
    generateQuestions: jest.fn(),
  };

  const mockAIApplicantAnalysisService = {
    analyzeApplicant: jest.fn(),
  };

  const mockCvsService = {
    getCvTextForStudent: jest.fn(),
  };

  const organizationMembership = {
    organizationId: 'org-1',
    userId: 'user-1',
    organization: {
      id: 'org-1',
      deletedAt: null,
    },
  };

  const opportunity = {
    id: 'opportunity-1',
    organizationId: 'org-1',
    title: 'Software Engineering Internship',
    description: 'Software engineering internship opportunity',
    opportunityType: 'INTERNSHIP',
    location: 'Addis Ababa',
    isRemote: false,
    minimumAcademicYear: 3,
    maximumAcademicYear: 5,
    minimumGpa: 3.0,
    eligibleFields: ['Computer Science'],
    skills: [
      {
        skill: {
          id: 'skill-1',
          name: 'TypeScript',
          category: 'Programming',
        },
        requirementLevel: 'REQUIRED',
      },
      {
        skill: {
          id: 'skill-2',
          name: 'React',
          category: 'Frontend',
        },
        requirementLevel: 'PREFERRED',
      },
    ],
  };

  const generatedQuestions = {
    questions: [
      {
        question: 'Explain TypeScript interfaces.',
      },
      {
        question: 'How do you manage state in React?',
      },
    ],
  };

  const assessment = {
    id: 'assessment-1',
    opportunityId: 'opportunity-1',
    title: 'Software Engineering Internship Assessment',
    status: AssessmentStatus.ACTIVE,
    questions: [
      {
        id: 'question-1',
        questionText: 'Explain TypeScript interfaces.',
        questionType: AssessmentQuestionType.TEXT,
        questionOrder: 1,
      },
      {
        id: 'question-2',
        questionText: 'How do you manage state in React?',
        questionType: AssessmentQuestionType.TEXT,
        questionOrder: 2,
      },
    ],
  };

  const attempt = {
    id: 'attempt-1',
    applicationId: 'application-1',
    assessmentId: 'assessment-1',
    status: 'IN_PROGRESS',
    startedAt: new Date(),
    submittedAt: null,
  };

  const answer = {
    id: 'answer-1',
    assessmentAttemptId: 'attempt-1',
    assessmentQuestionId: 'question-1',
    answerText: 'A TypeScript interface defines the shape of an object.',
  };

  const assessmentResult = {
    id: 'result-1',
    assessmentAttemptId: 'attempt-1',
    aiScore: 85,
    aiRequirementMatch: 'Strong match',
    aiStrengths: ['TypeScript knowledge'],
    aiGaps: ['Limited React experience'],
    aiSummary: 'Strong candidate overall.',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AssessmentsService,
          {
            provide: AssessmentsRepository,
            useValue: mockAssessmentsRepository,
          },
          {
            provide: OrganizationProfileRepository,
            useValue: mockOrganizationProfileRepository,
          },
          {
            provide: OpportunitiesRepository,
            useValue: mockOpportunitiesRepository,
          },
          {
            provide: AIQuestionService,
            useValue: mockAIQuestionService,
          },
          {
            provide: AIApplicantAnalysisService,
            useValue: mockAIApplicantAnalysisService,
          },
          {
            provide: CvsService,
            useValue: mockCvsService,
          },
        ],
      }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
  });

  describe('createAssessment', () => {
    it('should throw NotFoundException when organization membership is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        null,
      );

      await expect(
        service.createAssessment('user-1', 'opportunity-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when organization is deleted', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        ...organizationMembership,
        organization: {
          ...organizationMembership.organization,
          deletedAt: new Date(),
        },
      });

      await expect(
        service.createAssessment('user-1', 'opportunity-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when opportunity is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findById.mockResolvedValue(null);

      await expect(
        service.createAssessment('user-1', 'opportunity-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when organization does not own the opportunity', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findById.mockResolvedValue({
        ...opportunity,
        organizationId: 'different-org',
      });

      await expect(
        service.createAssessment('user-1', 'opportunity-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should generate AI questions and create an assessment for an organization opportunity', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findById.mockResolvedValue(
        opportunity,
      );

      mockAIQuestionService.generateQuestions.mockResolvedValue(
        generatedQuestions,
      );

      mockAssessmentsRepository.create.mockResolvedValue(
        assessment,
      );

      const result = await service.createAssessment(
        'user-1',
        'opportunity-1',
      );

      expect(
        mockAIQuestionService.generateQuestions,
      ).toHaveBeenCalledWith({
        title: opportunity.title,
        description: opportunity.description,
        requiredSkills: ['TypeScript'],
        location: opportunity.location,
        eligibleFields: opportunity.eligibleFields,
        minimumAcademicYear:
          opportunity.minimumAcademicYear,
        maximumAcademicYear:
          opportunity.maximumAcademicYear,
        minimumGpa: Number(opportunity.minimumGpa),
        opportunityType: opportunity.opportunityType,
      });

      expect(
        mockAssessmentsRepository.create,
      ).toHaveBeenCalledWith({
        opportunityId: 'opportunity-1',
        title: 'Software Engineering Internship Assessment',
        questions: [
          {
            questionText:
              'Explain TypeScript interfaces.',
            questionType:
              AssessmentQuestionType.TEXT,
            questionOrder: 1,
            isAiGenerated: true,
          },
          {
            questionText:
              'How do you manage state in React?',
            questionType:
              AssessmentQuestionType.TEXT,
            questionOrder: 2,
            isAiGenerated: true,
          },
        ],
      });

      expect(result).toEqual(assessment);
    });
  });

  describe('getAssessment', () => {
    it('should get an assessment', async () => {
      mockAssessmentsRepository.getAssessment.mockResolvedValue(
        assessment,
      );

      const result =
        await service.getAssessment('assessment-1');

      expect(
        mockAssessmentsRepository.getAssessment,
      ).toHaveBeenCalledWith('assessment-1');

      expect(result).toEqual(assessment);
    });
  });

  describe('getAssessmentQuestions', () => {
    it('should get assessment questions', async () => {
      const questions = assessment.questions;

      mockAssessmentsRepository.getAssessmentQuestions.mockResolvedValue(
        questions,
      );

      const result =
        await service.getAssessmentQuestions(
          'assessment-1',
        );

      expect(
        mockAssessmentsRepository.getAssessmentQuestions,
      ).toHaveBeenCalledWith('assessment-1');

      expect(result).toEqual(questions);
    });
  });

  describe('startAttempt', () => {
    it('should delegate startAttempt to repository', async () => {
      mockAssessmentsRepository.createAttempt.mockResolvedValue(
        attempt,
      );

      const data = {
        applicationId: 'application-1',
        assessmentId: 'assessment-1',
      };

      const result = await service.startAttempt(data);

      expect(
        mockAssessmentsRepository.createAttempt,
      ).toHaveBeenCalledWith(data);

      expect(result).toEqual(attempt);
    });
  });

  describe('getAttempt', () => {
    it('should delegate getAttempt to repository', async () => {
      mockAssessmentsRepository.findAttemptById.mockResolvedValue(
        attempt,
      );

      const result =
        await service.getAttempt('attempt-1');

      expect(
        mockAssessmentsRepository.findAttemptById,
      ).toHaveBeenCalledWith('attempt-1');

      expect(result).toEqual(attempt);
    });
  });

  describe('getAttemptWithAnswers', () => {
    it('should delegate getAttemptWithAnswers to repository', async () => {
      const attemptWithAnswers = {
        ...attempt,
        answers: [answer],
      };

      mockAssessmentsRepository.findAttemptByIdWithAnswers.mockResolvedValue(
        attemptWithAnswers,
      );

      const result =
        await service.getAttemptWithAnswers(
          'attempt-1',
        );

      expect(
        mockAssessmentsRepository.findAttemptByIdWithAnswers,
      ).toHaveBeenCalledWith('attempt-1');

      expect(result).toEqual(attemptWithAnswers);
    });
  });

  describe('getAttemptByApplicationId', () => {
    it('should delegate getAttemptByApplicationId to repository', async () => {
      mockAssessmentsRepository.findAttemptByApplicationId.mockResolvedValue(
        attempt,
      );

      const result =
        await service.getAttemptByApplicationId(
          'application-1',
        );

      expect(
        mockAssessmentsRepository.findAttemptByApplicationId,
      ).toHaveBeenCalledWith('application-1');

      expect(result).toEqual(attempt);
    });
  });

  describe('submitAttempt', () => {
    it('should delegate submitAttempt to repository', async () => {
      const submittedAttempt = {
        ...attempt,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      };

      mockAssessmentsRepository.submitAttempt.mockResolvedValue(
        submittedAttempt,
      );

      const result =
        await service.submitAttempt('attempt-1');

      expect(
        mockAssessmentsRepository.submitAttempt,
      ).toHaveBeenCalledWith('attempt-1');

      expect(result).toEqual(submittedAttempt);
    });
  });

  describe('saveAnswer', () => {
    it('should delegate saveAnswer to repository', async () => {
      mockAssessmentsRepository.saveAnswer.mockResolvedValue(
        answer,
      );

      const data = {
        assessmentAttemptId: 'attempt-1',
        assessmentQuestionId: 'question-1',
        answerText: 'My answer',
      };

      const result =
        await service.saveAnswer(data);

      expect(
        mockAssessmentsRepository.saveAnswer,
      ).toHaveBeenCalledWith(data);

      expect(result).toEqual(answer);
    });
  });

  describe('saveAnswers', () => {
    it('should delegate saveAnswers to repository', async () => {
      const answers = [
        {
          assessmentQuestionId: 'question-1',
          answerText: 'Answer one',
        },
        {
          assessmentQuestionId: 'question-2',
          answerText: 'Answer two',
        },
      ];

      mockAssessmentsRepository.saveAnswers.mockResolvedValue(
        answers,
      );

      const result = await service.saveAnswers(
        'attempt-1',
        answers,
      );

      expect(
        mockAssessmentsRepository.saveAnswers,
      ).toHaveBeenCalledWith(
        'attempt-1',
        answers,
      );

      expect(result).toEqual(answers);
    });
  });

  describe('getAnswersByAttempt', () => {
    it('should delegate getAnswersByAttempt to repository', async () => {
      mockAssessmentsRepository.findAnswersByAttemptId.mockResolvedValue(
        [answer],
      );

      const result =
        await service.getAnswersByAttempt(
          'attempt-1',
        );

      expect(
        mockAssessmentsRepository.findAnswersByAttemptId,
      ).toHaveBeenCalledWith('attempt-1');

      expect(result).toEqual([answer]);
    });
  });

  describe('getEligibleApplicantsForAnalysis', () => {
    it('should delegate getEligibleApplicantsForAnalysis to repository', async () => {
      const applicants = [
        {
          id: 'application-1',
          opportunityId: 'opportunity-1',
        },
      ];

      mockAssessmentsRepository.findEligibleApplicantsForAnalysis.mockResolvedValue(
        applicants,
      );

      const result =
        await service.getEligibleApplicantsForAnalysis(
          'opportunity-1',
        );

      expect(
        mockAssessmentsRepository.findEligibleApplicantsForAnalysis,
      ).toHaveBeenCalledWith(
        'opportunity-1',
      );

      expect(result).toEqual(applicants);
    });
  });

  describe('saveAssessmentResult', () => {
    it('should delegate saveAssessmentResult to repository', async () => {
      const data = {
        assessmentAttemptId: 'attempt-1',
        aiScore: 85,
        aiRequirementMatch: 'Strong match',
        aiStrengths: ['TypeScript'],
        aiGaps: ['React'],
        aiSummary: 'Strong candidate.',
      };

      mockAssessmentsRepository.saveAssessmentResult.mockResolvedValue(
        assessmentResult,
      );

      const result =
        await service.saveAssessmentResult(data);

      expect(
        mockAssessmentsRepository.saveAssessmentResult,
      ).toHaveBeenCalledWith(data);

      expect(result).toEqual(assessmentResult);
    });
  });

  describe('buildApplicantAnalysisInput', () => {
    const analysisData = {
      id: 'application-1',
      studentProfile: {
        userId: 'student-user-1',
        academicYear: 4,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Become a software engineer',
        careerGoalTags: ['software engineering'],
        interests: ['AI', 'Web Development'],

        skills: [
          {
            proficiency: 4,
            yearsOfExperience: 2,
            skill: {
              name: 'TypeScript',
              category: 'Programming',
            },
          },
        ],

        experiences: [
          {
            title: 'Software Developer Intern',
            organizationName: 'Example Company',
            experienceType: 'INTERNSHIP',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-08-30'),
            location: 'Addis Ababa',
            description: 'Built web applications.',
          },
        ],

        cvs: [
          {
            fileName: 'student-cv.pdf',
            filePath:
              'student-user-1/student-cv.pdf',
            fileType: 'application/pdf',
            isDefault: true,
            uploadedAt: new Date('2026-01-01'),
          },
        ],
      },

      opportunity: {
        id: 'opportunity-1',
        title: 'Software Engineering Internship',
        description: 'Build software applications.',
        opportunityType: 'INTERNSHIP',
        location: 'Addis Ababa',
        isRemote: false,
        minimumAcademicYear: 3,
        maximumAcademicYear: 5,
        minimumGpa: 3.0,
        eligibleFields: ['Computer Science'],

        skills: [
          {
            requirementLevel: 'REQUIRED',
            skill: {
              name: 'TypeScript',
              category: 'Programming',
            },
          },
        ],
      },

      assessmentAttempt: {
        id: 'attempt-1',
        assessment: {
          questions: [
            {
              id: 'question-1',
              questionText:
                'Explain TypeScript interfaces.',
              questionType: 'TEXT',
              questionOrder: 1,
              options: null,
              referenceAnswer: null,
              evaluationGuidance:
                'Look for understanding of interfaces.',
              requirementLevel: 'REQUIRED',
            },
          ],
        },
        answers: [
          {
            assessmentQuestionId: 'question-1',
            answerText:
              'Interfaces define the structure of objects.',
            question: {
              questionText:
                'Explain TypeScript interfaces.',
              questionOrder: 1,
            },
          },
        ],
      },
    };

    it('should build applicant analysis input with extracted CV text', async () => {
      const cvText =
        'Lidiya is a Computer Science student with TypeScript experience.';

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        analysisData,
      );

      mockCvsService.getCvTextForStudent.mockResolvedValue(
        cvText,
      );

      const result =
        await service.buildApplicantAnalysisInput(
          'application-1',
        );

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).toHaveBeenCalledWith('application-1');

      expect(
        mockCvsService.getCvTextForStudent,
      ).toHaveBeenCalledWith(
        'student-user-1',
      );

      expect(result.applicant.cvText).toBe(
        cvText,
      );

      expect(result.applicant.profile).toEqual({
        academicYear: 4,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals:
          'Become a software engineer',
        careerGoalTags: ['software engineering'],
        interests: ['AI', 'Web Development'],
      });

      expect(result.opportunity.title).toBe(
        'Software Engineering Internship',
      );

      expect(result.assessment.questions).toHaveLength(
        1,
      );

      expect(result.assessment.answers).toHaveLength(
        1,
      );
    });

    it('should throw NotFoundException when submitted analysis data is not found', async () => {
      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        null,
      );

      await expect(
        service.buildApplicantAnalysisInput(
          'application-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockCvsService.getCvTextForStudent,
      ).not.toHaveBeenCalled();
    });
  });

  describe('analyzeApplicant', () => {
    const analysisData = {
      id: 'application-1',
      studentProfile: {
        userId: 'student-user-1',
        academicYear: 4,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Become a software engineer',
        careerGoalTags: ['software engineering'],
        interests: ['AI', 'Web Development'],

        skills: [
          {
            proficiency: 4,
            yearsOfExperience: 2,
            skill: {
              name: 'TypeScript',
              category: 'Programming',
            },
          },
        ],

        experiences: [
          {
            title: 'Software Developer Intern',
            organizationName: 'Example Company',
            experienceType: 'INTERNSHIP',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-08-30'),
            location: 'Addis Ababa',
            description: 'Built web applications.',
          },
        ],

        cvs: [
          {
            fileName: 'student-cv.pdf',
            filePath:
              'student-user-1/student-cv.pdf',
            fileType: 'application/pdf',
            isDefault: true,
            uploadedAt: new Date('2026-01-01'),
          },
        ],
      },

      opportunity: {
        id: 'opportunity-1',
        title: 'Software Engineering Internship',
        description: 'Build software applications.',
        opportunityType: 'INTERNSHIP',
        location: 'Addis Ababa',
        isRemote: false,
        minimumAcademicYear: 3,
        maximumAcademicYear: 5,
        minimumGpa: 3.0,
        eligibleFields: ['Computer Science'],

        skills: [
          {
            requirementLevel: 'REQUIRED',
            skill: {
              name: 'TypeScript',
              category: 'Programming',
            },
          },
        ],
      },

      assessmentAttempt: {
        id: 'attempt-1',
        assessment: {
          questions: [
            {
              id: 'question-1',
              questionText:
                'Explain TypeScript interfaces.',
              questionType: 'TEXT',
              questionOrder: 1,
              options: null,
              referenceAnswer: null,
              evaluationGuidance:
                'Look for understanding of interfaces.',
              requirementLevel: 'REQUIRED',
            },
          ],
        },
        answers: [
          {
            assessmentQuestionId: 'question-1',
            answerText:
              'Interfaces define the structure of objects.',
            question: {
              questionText:
                'Explain TypeScript interfaces.',
              questionOrder: 1,
            },
          },
        ],
      },
    };

    const aiAnalysis = {
      applicantId: 'student-user-1',
      applicationId: 'application-1',
      opportunityId: 'opportunity-1',
      overallScore: 88,
      requirementMatch: 'Strong match',
      skillAnalysis: {
        TypeScript: {
          matched: true,
          evidence: 'Student profile and CV',
        },
      },
      strengths: [
        'TypeScript experience',
        'Relevant education',
      ],
      gaps: ['Limited professional experience'],
      summary:
        'Strong candidate for the opportunity.',
    };

    it('should analyze an applicant and save the AI result with extracted CV text', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        analysisData,
      );

      mockCvsService.getCvTextForStudent.mockResolvedValue(
        'Student CV text with TypeScript and software engineering experience.',
      );

      mockAIApplicantAnalysisService.analyzeApplicant.mockResolvedValue(
        aiAnalysis,
      );

      mockAssessmentsRepository.saveAssessmentResult.mockResolvedValue(
        assessmentResult,
      );

      const result =
        await service.analyzeApplicant(
          'user-1',
          'opportunity-1',
          'application-1',
        );

      expect(
        mockOrganizationProfileRepository.findByUserId,
      ).toHaveBeenCalledWith('user-1');

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).toHaveBeenCalledWith(
        'opportunity-1',
        'org-1',
      );

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).toHaveBeenCalledWith(
        'application-1',
      );

      expect(
        mockCvsService.getCvTextForStudent,
      ).toHaveBeenCalledWith(
        'student-user-1',
      );

      expect(
        mockAIApplicantAnalysisService.analyzeApplicant,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          applicantId: 'student-user-1',
          applicationId: 'application-1',
          opportunityId: 'opportunity-1',
          applicant: expect.objectContaining({
            cvText:
              'Student CV text with TypeScript and software engineering experience.',
          }),
        }),
      );

      expect(
        mockAssessmentsRepository.saveAssessmentResult,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          assessmentAttemptId: 'attempt-1',
          aiScore: 88,
          aiRequirementMatch:
            'Strong match',
          aiStrengths: [
            'TypeScript experience',
            'Relevant education',
          ],
          aiGaps: [
            'Limited professional experience',
          ],
          aiSummary:
            'Strong candidate for the opportunity.',
          aiEvaluatedAt: expect.any(Date),
        }),
      );

      expect(result).toEqual({
        applicationId: 'application-1',
        opportunityId: 'opportunity-1',
        analysis: aiAnalysis,
        result: assessmentResult,
      });
    });

    it('should throw NotFoundException when organization membership is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        null,
      );

      await expect(
        service.analyzeApplicant(
          'user-1',
          'opportunity-1',
          'application-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockAIApplicantAnalysisService.analyzeApplicant,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when opportunity is not owned by the organization', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        null,
      );

      await expect(
        service.analyzeApplicant(
          'user-1',
          'opportunity-1',
          'application-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockAIApplicantAnalysisService.analyzeApplicant,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when submitted applicant analysis data is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        null,
      );

      await expect(
        service.analyzeApplicant(
          'user-1',
          'opportunity-1',
          'application-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockCvsService.getCvTextForStudent,
      ).not.toHaveBeenCalled();

      expect(
        mockAIApplicantAnalysisService.analyzeApplicant,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when application belongs to a different opportunity', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        {
          ...analysisData,
          opportunity: {
            ...analysisData.opportunity,
            id: 'different-opportunity',
          },
        },
      );

      await expect(
        service.analyzeApplicant(
          'user-1',
          'opportunity-1',
          'application-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockCvsService.getCvTextForStudent,
      ).not.toHaveBeenCalled();

      expect(
        mockAIApplicantAnalysisService.analyzeApplicant,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when submitted assessment attempt is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        {
          ...analysisData,
          assessmentAttempt: null,
        },
      );

      await expect(
        service.analyzeApplicant(
          'user-1',
          'opportunity-1',
          'application-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockCvsService.getCvTextForStudent,
      ).not.toHaveBeenCalled();

      expect(
        mockAIApplicantAnalysisService.analyzeApplicant,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getAssessmentResultById', () => {
    it('should delegate result retrieval by ID to repository', async () => {
      mockAssessmentsRepository.findAssessmentResultById.mockResolvedValue(
        assessmentResult,
      );

      const result =
        await service.getAssessmentResultById(
          'result-1',
        );

      expect(
        mockAssessmentsRepository.findAssessmentResultById,
      ).toHaveBeenCalledWith('result-1');

      expect(result).toEqual(assessmentResult);
    });
  });

  describe('getAssessmentResultByAttemptId', () => {
    it('should delegate result retrieval by attempt ID to repository', async () => {
      mockAssessmentsRepository.findAssessmentResultByAttemptId.mockResolvedValue(
        assessmentResult,
      );

      const result =
        await service.getAssessmentResultByAttemptId(
          'attempt-1',
        );

      expect(
        mockAssessmentsRepository.findAssessmentResultByAttemptId,
      ).toHaveBeenCalledWith(
        'attempt-1',
      );

      expect(result).toEqual(assessmentResult);
    });
  });

  describe('getAssessmentResultByApplicationId', () => {
    it('should delegate result retrieval by application ID to repository', async () => {
      mockAssessmentsRepository.findAssessmentResultByApplicationId.mockResolvedValue(
        assessmentResult,
      );

      const result =
        await service.getAssessmentResultByApplicationId(
          'application-1',
        );

      expect(
        mockAssessmentsRepository.findAssessmentResultByApplicationId,
      ).toHaveBeenCalledWith(
        'application-1',
      );

      expect(result).toEqual(assessmentResult);
    });
  });

  describe('getAssessmentResultsByOpportunity', () => {
    it('should throw NotFoundException when organization membership is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        null,
      );

      await expect(
        service.getAssessmentResultsByOpportunity(
          'user-1',
          'opportunity-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when opportunity is not found for organization', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        null,
      );

      await expect(
        service.getAssessmentResultsByOpportunity(
          'user-1',
          'opportunity-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return assessment results for an organization opportunity', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.findAssessmentResultsByOpportunityId.mockResolvedValue(
        [assessmentResult],
      );

      const options = {
        minScore: 70,
        sortBy: 'finalScore',
        sortOrder: 'desc',
      };

      const result =
        await service.getAssessmentResultsByOpportunity(
          'user-1',
          'opportunity-1',
          options,
        );

      expect(
        mockAssessmentsRepository.findAssessmentResultsByOpportunityId,
      ).toHaveBeenCalledWith(
        'opportunity-1',
        options,
      );

      expect(result).toEqual([
        assessmentResult,
      ]);
    });
  });

  describe('startAssessment', () => {
    it('should throw NotFoundException if organization membership is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow('Organization membership not found.');
    });

    it('should throw NotFoundException if organization is deleted', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: new Date(),
        },
      });

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow('Organization membership not found.');
    });

    it('should throw NotFoundException if opportunity is not found', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      });
      mockOpportunitiesRepository.findById.mockResolvedValue(null);

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow('Opportunity not found.');
    });

    it('should throw ForbiddenException if opportunity belongs to different organization', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      });
      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: 'opp-123',
        organizationId: 'different-org',
        applicationDeadline: new Date(Date.now() - 60000),
      });

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow(
        'You are not authorized to start an assessment for this opportunity.',
      );
    });

    it('should throw BadRequestException if opportunity has no application deadline', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      });
      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: 'opp-123',
        organizationId: 'org-123',
        applicationDeadline: null,
      });

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow(
        'This opportunity does not have an application deadline.',
      );
    });

    it('should prevent starting an assessment before the application deadline', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      });

      const futureDeadline = new Date(Date.now() + 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: 'opp-123',
        organizationId: 'org-123',
        applicationDeadline: futureDeadline,
      });

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow('The application deadline has not passed yet.');

      expect(mockAssessmentsRepository.getAssessment).not.toHaveBeenCalled();
      expect(mockAssessmentsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if assessment not found for opportunity', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      });

      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: 'opp-123',
        organizationId: 'org-123',
        applicationDeadline: pastDeadline,
      });
      mockAssessmentsRepository.getAssessment.mockResolvedValue(null);

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow('Assessment not found for this opportunity.');
    });

    it('should throw BadRequestException if assessment is not in DRAFT status', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      });

      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: 'opp-123',
        organizationId: 'org-123',
        applicationDeadline: pastDeadline,
      });
      mockAssessmentsRepository.getAssessment.mockResolvedValue({
        id: 'assessment-123',
        opportunityId: 'opp-123',
        status: AssessmentStatus.ACTIVE,
      });

      await expect(
        service.startAssessment('user-123', 'opp-123'),
      ).rejects.toThrow('Assessment cannot be started from ACTIVE status.');
    });

    it('should start a draft assessment after the application deadline', async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      });

      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: 'opp-123',
        organizationId: 'org-123',
        applicationDeadline: pastDeadline,
      });

      mockAssessmentsRepository.getAssessment.mockResolvedValue({
        id: 'assessment-123',
        opportunityId: 'opp-123',
        status: AssessmentStatus.DRAFT,
      });

      mockAssessmentsRepository.update.mockResolvedValue({
        id: 'assessment-123',
        opportunityId: 'opp-123',
        status: AssessmentStatus.ACTIVE,
      });

      const result = await service.startAssessment('user-123', 'opp-123');

      expect(mockAssessmentsRepository.getAssessment).toHaveBeenCalledWith(
        'opp-123',
      );
      expect(mockAssessmentsRepository.update).toHaveBeenCalledWith(
        'assessment-123',
        {
          status: AssessmentStatus.ACTIVE,
        },
      );
      expect(result).toEqual({
        id: 'assessment-123',
        opportunityId: 'opp-123',
        status: AssessmentStatus.ACTIVE,
      });
    });
  });
});
