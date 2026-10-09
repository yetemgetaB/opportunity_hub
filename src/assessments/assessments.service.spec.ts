import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { AssessmentQuestionType, AssessmentStatus } from "@prisma/client";

import { AssessmentsService } from "./assessments.service";
import { AssessmentsRepository } from "./assessments.repository";
import { OrganizationProfileRepository } from "@/organization-profile/organization-profile.repository";
import { OpportunitiesRepository } from "@/opportunities/opportunities.repository";
import { AIQuestionService } from "./ai-question.service";
import { AIApplicantAnalysisService } from "./ai-applicant-analysis.service";
import { CvsService } from "@/student-profile/cvs.service";
import { ApplicationsRepository } from "@/applications/applications.repository";
import { NotificationsService } from "@/notifications/notifications.service";
import { ApplicationStatus } from "@prisma/client";

describe("AssessmentsService", () => {
  let service: AssessmentsService;

  const mockAssessmentsRepository = {
    create: jest.fn(),
    getAssessment: jest.fn(),
    findByOpportunityIdWithQuestions: jest.fn(),
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

  const mockApplicationsRepository = {
    findById: jest.fn(),
    findByOpportunityId: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotification: jest.fn(),
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
    organizationId: "org-1",
    userId: "user-1",
    organization: {
      id: "org-1",
      deletedAt: null,
    },
  };

  const opportunity = {
    id: "opportunity-1",
    organizationId: "org-1",
    title: "Software Engineering Internship",
    description: "Software engineering internship opportunity",
    opportunityType: "INTERNSHIP",
    location: "Addis Ababa",
    isRemote: false,
    minimumAcademicYear: 3,
    maximumAcademicYear: 5,
    minimumGpa: 3.0,
    eligibleFields: ["Computer Science"],
    skills: [
      {
        skill: {
          id: "skill-1",
          name: "TypeScript",
          category: "Programming",
        },
        requirementLevel: "REQUIRED",
      },
      {
        skill: {
          id: "skill-2",
          name: "React",
          category: "Frontend",
        },
        requirementLevel: "PREFERRED",
      },
    ],
  };

  const generatedQuestions = {
    questions: [
      {
        question: "Explain TypeScript interfaces.",
      },
      {
        question: "How do you manage state in React?",
      },
    ],
  };

  const assessment = {
    id: "assessment-1",
    opportunityId: "opportunity-1",
    title: "Software Engineering Internship Assessment",
    status: AssessmentStatus.ACTIVE,
    questions: [
      {
        id: "question-1",
        questionText: "Explain TypeScript interfaces.",
        questionType: AssessmentQuestionType.TEXT,
        questionOrder: 1,
      },
      {
        id: "question-2",
        questionText: "How do you manage state in React?",
        questionType: AssessmentQuestionType.TEXT,
        questionOrder: 2,
      },
    ],
  };

  const attempt = {
    id: "attempt-1",
    applicationId: "application-1",
    assessmentId: "assessment-1",
    status: "IN_PROGRESS",
    startedAt: new Date(),
    submittedAt: null,
  };

  const answer = {
    id: "answer-1",
    assessmentAttemptId: "attempt-1",
    assessmentQuestionId: "question-1",
    answerText: "A TypeScript interface defines the shape of an object.",
  };

  const assessmentResult = {
    id: "result-1",
    assessmentAttemptId: "attempt-1",
    aiScore: 85,
    aiRequirementMatch: "Strong match",
    aiStrengths: ["TypeScript knowledge"],
    aiGaps: ["Limited React experience"],
    aiSummary: "Strong candidate overall.",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
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
          provide: ApplicationsRepository,
          useValue: mockApplicationsRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
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

  describe("createAssessment", () => {
    it("should throw NotFoundException when organization membership is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.createAssessment("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when organization is deleted", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        ...organizationMembership,
        organization: {
          ...organizationMembership.organization,
          deletedAt: new Date(),
        },
      });

      await expect(
        service.createAssessment("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when opportunity is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findById.mockResolvedValue(null);

      await expect(
        service.createAssessment("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when organization does not own the opportunity", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findById.mockResolvedValue({
        ...opportunity,
        organizationId: "different-org",
      });

      await expect(
        service.createAssessment("user-1", "opportunity-1"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should generate AI questions and create an assessment for an organization opportunity", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findById.mockResolvedValue(opportunity);

      mockAIQuestionService.generateQuestions.mockResolvedValue(
        generatedQuestions,
      );

      mockAssessmentsRepository.create.mockResolvedValue(assessment);

      const result = await service.createAssessment("user-1", "opportunity-1");

      expect(mockAIQuestionService.generateQuestions).toHaveBeenCalledWith({
        title: opportunity.title,
        description: opportunity.description,
        requiredSkills: ["TypeScript"],
        location: opportunity.location,
        eligibleFields: opportunity.eligibleFields,
        minimumAcademicYear: opportunity.minimumAcademicYear,
        maximumAcademicYear: opportunity.maximumAcademicYear,
        minimumGpa: Number(opportunity.minimumGpa),
        opportunityType: opportunity.opportunityType,
      });

      expect(mockAssessmentsRepository.create).toHaveBeenCalledWith({
        opportunityId: "opportunity-1",
        title: "Software Engineering Internship Assessment",
        questions: [
          {
            questionText: "Explain TypeScript interfaces.",
            questionType: AssessmentQuestionType.TEXT,
            questionOrder: 1,
            isAiGenerated: true,
          },
          {
            questionText: "How do you manage state in React?",
            questionType: AssessmentQuestionType.TEXT,
            questionOrder: 2,
            isAiGenerated: true,
          },
        ],
      });

      expect(result).toEqual(assessment);
    });
  });

  describe("getAssessment", () => {
    it("should get an assessment", async () => {
      mockAssessmentsRepository.getAssessment.mockResolvedValue(assessment);

      const result = await service.getAssessment("assessment-1");

      expect(mockAssessmentsRepository.getAssessment).toHaveBeenCalledWith(
        "assessment-1",
      );

      expect(result).toEqual(assessment);
    });
  });

  describe("getAssessmentQuestions", () => {
    it("should get assessment questions", async () => {
      const questions = assessment.questions;

      mockAssessmentsRepository.getAssessmentQuestions.mockResolvedValue(
        questions,
      );

      const result = await service.getAssessmentQuestions("assessment-1");

      expect(
        mockAssessmentsRepository.getAssessmentQuestions,
      ).toHaveBeenCalledWith("assessment-1");

      expect(result).toEqual(questions);
    });
  });

  describe("startAssessment", () => {
    it("should throw NotFoundException if organization membership is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow("Organization membership not found.");
    });

    it("should throw NotFoundException if organization is deleted", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: new Date(),
        },
      });

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow("Organization membership not found.");
    });

    it("should throw NotFoundException if opportunity is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: null,
        },
      });

      mockOpportunitiesRepository.findById.mockResolvedValue(null);

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow("Opportunity not found.");
    });

    it("should throw ForbiddenException if opportunity belongs to different organization", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: null,
        },
      });

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: "opp-123",
        organizationId: "different-org",
        applicationDeadline: new Date(Date.now() - 60000),
      });

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow(
        "You are not authorized to start an assessment for this opportunity.",
      );
    });

    it("should throw BadRequestException if opportunity has no application deadline", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: null,
        },
      });

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: "opp-123",
        organizationId: "org-123",
        applicationDeadline: null,
      });

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow(
        "This opportunity does not have an application deadline.",
      );
    });

    it("should prevent starting an assessment before the application deadline", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: null,
        },
      });

      const futureDeadline = new Date(Date.now() + 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: "opp-123",
        organizationId: "org-123",
        applicationDeadline: futureDeadline,
      });

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow("The application deadline has not passed yet.");

      expect(mockAssessmentsRepository.getAssessment).not.toHaveBeenCalled();

      expect(
        mockAssessmentsRepository.findByOpportunityIdWithQuestions,
      ).not.toHaveBeenCalled();

      expect(mockAssessmentsRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if assessment not found for opportunity", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: null,
        },
      });

      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: "opp-123",
        organizationId: "org-123",
        applicationDeadline: pastDeadline,
      });

      mockAssessmentsRepository.findByOpportunityIdWithQuestions.mockResolvedValue(
        null,
      );

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow("Assessment not found for this opportunity.");
    });

    it("should throw BadRequestException if assessment is not in DRAFT status", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: null,
        },
      });

      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: "opp-123",
        organizationId: "org-123",
        applicationDeadline: pastDeadline,
      });

      mockAssessmentsRepository.findByOpportunityIdWithQuestions.mockResolvedValue(
        {
          id: "assessment-123",
          opportunityId: "opp-123",
          status: AssessmentStatus.ACTIVE,
        },
      );

      await expect(
        service.startAssessment("user-123", "opp-123"),
      ).rejects.toThrow("Assessment cannot be started from ACTIVE status.");
    });

    it("should start a draft assessment after the application deadline", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        organizationId: "org-123",
        organization: {
          deletedAt: null,
        },
      });

      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);

      mockOpportunitiesRepository.findById.mockResolvedValue({
        id: "opp-123",
        organizationId: "org-123",
        applicationDeadline: pastDeadline,
      });

      mockAssessmentsRepository.findByOpportunityIdWithQuestions.mockResolvedValue(
        {
          id: "assessment-123",
          opportunityId: "opp-123",
          status: AssessmentStatus.DRAFT,
        },
      );

      mockAssessmentsRepository.update.mockResolvedValue({
        id: "assessment-123",
        opportunityId: "opp-123",
        status: AssessmentStatus.ACTIVE,
      });

      mockApplicationsRepository.findByOpportunityId.mockResolvedValue([
        {
          id: "application-1",
          studentProfile: {
            user: {
              id: "student-1",
            },
          },
        },
      ]);

      const result = await service.startAssessment("user-123", "opp-123");

      expect(
        mockAssessmentsRepository.findByOpportunityIdWithQuestions,
      ).toHaveBeenCalledWith("opp-123");

      expect(mockAssessmentsRepository.update).toHaveBeenCalledWith(
        "assessment-123",
        {
          status: AssessmentStatus.ACTIVE,
        },
      );

      expect(result).toEqual({
        id: "assessment-123",
        opportunityId: "opp-123",
        status: AssessmentStatus.ACTIVE,
      });
    });
  });

  it("should notify eligible applicants when an assessment starts", async () => {
    const expiredOpportunity = {
      ...opportunity,
      applicationDeadline: new Date(Date.now() - 60 * 60 * 1000),
    };

    mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
      organizationMembership,
    );

    mockOpportunitiesRepository.findById.mockResolvedValue(expiredOpportunity);

    mockAssessmentsRepository.findByOpportunityIdWithQuestions.mockResolvedValue(
      {
        ...assessment,
        status: AssessmentStatus.DRAFT,
      },
    );

    mockAssessmentsRepository.update.mockResolvedValue({
      ...assessment,
      status: AssessmentStatus.ACTIVE,
    });

    mockApplicationsRepository.findByOpportunityId.mockResolvedValue([
      {
        id: "application-1",
        studentProfile: {
          user: {
            id: "student-1",
          },
        },
      },
      {
        id: "application-2",
        studentProfile: {
          user: {
            id: "student-2",
          },
        },
      },
    ]);

    mockNotificationsService.sendNotification.mockResolvedValue({
      id: "notification-1",
    });

    const result = await service.startAssessment("user-1", opportunity.id);

    expect(result.status).toBe(AssessmentStatus.ACTIVE);

    expect(mockApplicationsRepository.findByOpportunityId).toHaveBeenCalledWith(
      opportunity.id,
      { status: "SUBMITTED" },
    );

    expect(mockNotificationsService.sendNotification).toHaveBeenCalledTimes(2);

    expect(mockNotificationsService.sendNotification).toHaveBeenNthCalledWith(
      1,
      "student-1",
      "Assessment Invitation",
      `You have been invited to complete the assessment for ${opportunity.title}.`,
      "assessment_invitation:application-1",
    );

    expect(mockNotificationsService.sendNotification).toHaveBeenNthCalledWith(
      2,
      "student-2",
      "Assessment Invitation",
      `You have been invited to complete the assessment for ${opportunity.title}.`,
      "assessment_invitation:application-2",
    );
  });

  it("should throw BadRequestException when no eligible applicants are found", async () => {
    mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
      organizationMembership,
    );

    mockOpportunitiesRepository.findById.mockResolvedValue({
      ...opportunity,
      applicationDeadline: new Date(Date.now() - 60 * 60 * 1000),
    });

    mockAssessmentsRepository.findByOpportunityIdWithQuestions.mockResolvedValue(
      {
        ...assessment,
        status: AssessmentStatus.DRAFT,
      },
    );

    mockApplicationsRepository.findByOpportunityId.mockResolvedValue([]);

    await expect(
      service.startAssessment("user-1", opportunity.id),
    ).rejects.toThrow(BadRequestException);

    expect(mockApplicationsRepository.findByOpportunityId).toHaveBeenCalledWith(
      opportunity.id,
      { status: ApplicationStatus.SUBMITTED },
    );

    expect(mockAssessmentsRepository.update).not.toHaveBeenCalled();

    expect(mockNotificationsService.sendNotification).not.toHaveBeenCalled();
  });

  describe("startAttempt", () => {
    it("should start an assessment attempt", async () => {
      mockApplicationsRepository.findById.mockResolvedValue({
        studentProfile: {
          user: {
            id: "user-1",
          },
        },
      });

      mockAssessmentsRepository.createAttempt.mockResolvedValue(attempt);

      const result = await service.startAttempt("user-1", {
        applicationId: "application-1",
        assessmentId: "assessment-1",
      });

      expect(mockApplicationsRepository.findById).toHaveBeenCalledWith(
        "application-1",
      );

      expect(mockAssessmentsRepository.createAttempt).toHaveBeenCalledWith({
        applicationId: "application-1",
        assessmentId: "assessment-1",
      });

      expect(result).toEqual(attempt);
    });
  });

  describe("getAttempt", () => {
    it("should get an assessment attempt", async () => {
      mockAssessmentsRepository.findAttemptById.mockResolvedValue(attempt);

      const result = await service.getAttempt("attempt-1");

      expect(mockAssessmentsRepository.findAttemptById).toHaveBeenCalledWith(
        "attempt-1",
      );

      expect(result).toEqual(attempt);
    });
  });

  describe("getAttemptWithAnswers", () => {
    it("should get an assessment attempt with answers", async () => {
      const attemptWithAnswers = {
        ...attempt,
        application: {
          studentProfile: {
            user: {
              id: "user-1",
            },
          },
        },
        answers: [answer],
      };

      mockAssessmentsRepository.findAttemptByIdWithAnswers.mockResolvedValue(
        attemptWithAnswers,
      );

      const result = await service.getAttemptWithAnswers("user-1", "attempt-1");

      expect(
        mockAssessmentsRepository.findAttemptByIdWithAnswers,
      ).toHaveBeenCalledWith("attempt-1");

      expect(result).toEqual(attemptWithAnswers);
    });
  });

  describe("getAttemptByApplicationId", () => {
    it("should get an assessment attempt by application ID", async () => {
      mockAssessmentsRepository.findAttemptByApplicationId.mockResolvedValue(
        attempt,
      );

      const result = await service.getAttemptByApplicationId("application-1");

      expect(
        mockAssessmentsRepository.findAttemptByApplicationId,
      ).toHaveBeenCalledWith("application-1");

      expect(result).toEqual(attempt);
    });
  });

  describe("submitAttempt", () => {
    it("should submit an assessment attempt", async () => {
      const submittedAttempt = {
        ...attempt,
        status: "SUBMITTED",
        submittedAt: new Date(),
      };

      mockAssessmentsRepository.findAttemptByIdWithAnswers.mockResolvedValue({
        ...attempt,
        application: {
          studentProfile: {
            user: {
              id: "user-1",
            },
          },
        },
      });

      mockAssessmentsRepository.submitAttempt.mockResolvedValue(
        submittedAttempt,
      );

      const result = await service.submitAttempt("user-1", "attempt-1");

      expect(
        mockAssessmentsRepository.findAttemptByIdWithAnswers,
      ).toHaveBeenCalledWith("attempt-1");

      expect(mockAssessmentsRepository.submitAttempt).toHaveBeenCalledWith(
        "attempt-1",
      );

      expect(result).toEqual(submittedAttempt);
    });
  });

  describe("getSubmittedAttemptsByOpportunity", () => {
    it("should get submitted attempts by opportunity", async () => {
      const submittedAttempts = [attempt];

      mockAssessmentsRepository.findSubmittedAttemptsByOpportunityId.mockResolvedValue(
        submittedAttempts,
      );

      const result =
        await service.getSubmittedAttemptsByOpportunity("opportunity-1");

      expect(
        mockAssessmentsRepository.findSubmittedAttemptsByOpportunityId,
      ).toHaveBeenCalledWith("opportunity-1");

      expect(result).toEqual(submittedAttempts);
    });
  });

  describe("getSubmittedAttemptsByAssessment", () => {
    it("should get submitted attempts by assessment", async () => {
      const submittedAttempts = [attempt];

      mockAssessmentsRepository.findSubmittedAttemptsByAssessmentId.mockResolvedValue(
        submittedAttempts,
      );

      const result =
        await service.getSubmittedAttemptsByAssessment("assessment-1");

      expect(
        mockAssessmentsRepository.findSubmittedAttemptsByAssessmentId,
      ).toHaveBeenCalledWith("assessment-1");

      expect(result).toEqual(submittedAttempts);
    });
  });

  describe("saveAnswer", () => {
    it("should save an assessment answer", async () => {
      mockAssessmentsRepository.findAttemptByIdWithAnswers.mockResolvedValue({
        ...attempt,
        application: {
          studentProfile: {
            user: {
              id: "user-1",
            },
          },
        },
      });

      mockAssessmentsRepository.saveAnswer.mockResolvedValue(answer);

      const answerData = {
        assessmentAttemptId: "attempt-1",
        assessmentQuestionId: "question-1",
        answerText: "I have experience with TypeScript.",
      };

      const result = await service.saveAnswer("user-1", answerData);

      expect(
        mockAssessmentsRepository.findAttemptByIdWithAnswers,
      ).toHaveBeenCalledWith("attempt-1");

      expect(mockAssessmentsRepository.saveAnswer).toHaveBeenCalledWith(
        answerData,
      );

      expect(result).toEqual(answer);
    });
  });

  describe("saveAnswers", () => {
    it("should save multiple assessment answers", async () => {
      const answers = [
        {
          assessmentQuestionId: "question-1",
          answerText: "I have experience with TypeScript.",
        },
        {
          assessmentQuestionId: "question-2",
          answerText: "I have experience with React.",
        },
      ];

      const savedAnswers = [answer];

      mockAssessmentsRepository.saveAnswers.mockResolvedValue(savedAnswers);

      const result = await service.saveAnswers("user-1", "attempt-1", answers);

      expect(
        mockAssessmentsRepository.findAttemptByIdWithAnswers,
      ).toHaveBeenCalledWith("attempt-1");
      expect(mockAssessmentsRepository.saveAnswers).toHaveBeenCalledWith(
        "attempt-1",
        answers,
      );

      expect(result).toEqual(savedAnswers);
    });
  });

  describe("getAnswersByAttempt", () => {
    it("should get answers by assessment attempt", async () => {
      const answers = [answer];

      mockAssessmentsRepository.findAnswersByAttemptId.mockResolvedValue(
        answers,
      );

      const result = await service.getAnswersByAttempt("attempt-1");

      expect(
        mockAssessmentsRepository.findAnswersByAttemptId,
      ).toHaveBeenCalledWith("attempt-1");

      expect(result).toEqual(answers);
    });
  });

  describe("getApplicantAnalysisData", () => {
    it("should get applicant analysis data", async () => {
      const analysisData = {
        applicationId: "application-1",
      };

      mockAssessmentsRepository.getApplicantAnalysisData.mockResolvedValue(
        analysisData,
      );

      const result = await service.getApplicantAnalysisData("application-1");

      expect(
        mockAssessmentsRepository.getApplicantAnalysisData,
      ).toHaveBeenCalledWith("application-1");

      expect(result).toEqual(analysisData);
    });
  });

  describe("getSubmittedApplicantAnalysisData", () => {
    it("should get submitted applicant analysis data", async () => {
      const analysisData = {
        applicationId: "application-1",
      };

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        analysisData,
      );

      const result =
        await service.getSubmittedApplicantAnalysisData("application-1");

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).toHaveBeenCalledWith("application-1");

      expect(result).toEqual(analysisData);
    });
  });

  describe("getEligibleApplicantsForAnalysis", () => {
    it("should get eligible applicants for analysis", async () => {
      const applicants = [
        {
          applicationId: "application-1",
        },
        {
          applicationId: "application-2",
        },
      ];

      mockAssessmentsRepository.findEligibleApplicantsForAnalysis.mockResolvedValue(
        applicants,
      );

      const result =
        await service.getEligibleApplicantsForAnalysis("opportunity-1");

      expect(
        mockAssessmentsRepository.findEligibleApplicantsForAnalysis,
      ).toHaveBeenCalledWith("opportunity-1");

      expect(result).toEqual(applicants);
    });
  });

  describe("buildApplicantAnalysisInput", () => {
    it("should throw NotFoundException when submitted applicant data is not found", async () => {
      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        null,
      );

      await expect(
        service.buildApplicantAnalysisInput("application-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).toHaveBeenCalledWith("application-1");

      expect(mockCvsService.getCvTextForStudent).not.toHaveBeenCalled();
    });

    it("should build applicant analysis input with CV text", async () => {
      const submittedApplicantData = {
        id: "application-1",

        studentProfile: {
          userId: "user-1",
          academicYear: 3,
          university: "Unity University",
          fieldOfStudy: "Computer Science",
          location: "Addis Ababa",
          careerGoals: "Software Engineering",
          careerGoalTags: ["software", "backend"],
          interests: ["technology", "AI"],

          skills: [
            {
              skill: {
                name: "TypeScript",
                category: "Programming",
              },
              proficiency: "ADVANCED",
              yearsOfExperience: 2,
            },
          ],

          experiences: [
            {
              title: "Backend Developer Intern",
              organizationName: "Tech Company",
              experienceType: "INTERNSHIP",
              startDate: new Date("2025-01-01"),
              endDate: new Date("2025-06-01"),
              location: "Addis Ababa",
              description: "Worked on backend APIs.",
            },
          ],

          cvs: [
            {
              fileName: "cv.pdf",
              filePath: "/cvs/cv.pdf",
              fileType: "application/pdf",
              isDefault: true,
              uploadedAt: new Date("2025-01-01"),
            },
          ],
        },

        opportunity: {
          id: "opportunity-1",
          title: "Software Engineering Internship",
          description: "Backend development internship.",
          opportunityType: "INTERNSHIP",
          location: "Addis Ababa",
          isRemote: false,
          minimumAcademicYear: 3,
          maximumAcademicYear: 5,
          minimumGpa: 3.0,
          eligibleFields: ["Computer Science"],

          skills: [
            {
              skill: {
                name: "TypeScript",
                category: "Programming",
              },
              requirementLevel: "REQUIRED",
            },
          ],
        },

        assessmentAttempt: {
          id: "attempt-1",

          assessment: {
            questions: [
              {
                id: "question-1",
                questionText: "Explain TypeScript.",
                questionType: "TEXT",
                questionOrder: 1,
                options: null,
                referenceAnswer: null,
                evaluationGuidance: null,
                requirementLevel: null,
              },
            ],
          },

          answers: [
            {
              assessmentQuestionId: "question-1",
              answerText: "TypeScript is a typed superset of JavaScript.",
              question: {
                questionText: "Explain TypeScript.",
                questionOrder: 1,
              },
            },
          ],
        },
      };

      const cvText = "Experienced software developer with TypeScript skills.";

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        submittedApplicantData,
      );

      mockCvsService.getCvTextForStudent.mockResolvedValue(cvText);

      const result = await service.buildApplicantAnalysisInput("application-1");

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).toHaveBeenCalledWith("application-1");

      expect(mockCvsService.getCvTextForStudent).toHaveBeenCalledWith("user-1");

      expect(result).toBeDefined();
    });
  });

  describe("prepareApplicantAnalysis", () => {
    it("should throw NotFoundException when organization membership is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.prepareApplicantAnalysis("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockOrganizationProfileRepository.findByUserId,
      ).toHaveBeenCalledWith("user-1");

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when opportunity is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        null,
      );

      await expect(
        service.prepareApplicantAnalysis("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).toHaveBeenCalledWith("opportunity-1", "org-1");

      expect(
        mockAssessmentsRepository.findEligibleApplicantsForAnalysis,
      ).not.toHaveBeenCalled();
    });

    it("should prepare applicant analysis for an organization opportunity", async () => {
      const applicants = [
        {
          applicationId: "application-1",
        },
        {
          applicationId: "application-2",
        },
      ];

      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.findEligibleApplicantsForAnalysis.mockResolvedValue(
        applicants,
      );

      const result = await service.prepareApplicantAnalysis(
        "user-1",
        "opportunity-1",
      );

      expect(
        mockOrganizationProfileRepository.findByUserId,
      ).toHaveBeenCalledWith("user-1");

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).toHaveBeenCalledWith("opportunity-1", "org-1");

      expect(
        mockAssessmentsRepository.findEligibleApplicantsForAnalysis,
      ).toHaveBeenCalledWith("opportunity-1");

      expect(result).toEqual({
        opportunityId: "opportunity-1",
        eligibleApplicants: applicants,
        totalEligibleApplicants: 2,
      });
    });
  });

  describe("analyzeApplicant", () => {
    it("should throw NotFoundException when organization membership is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.analyzeApplicant("user-1", "opportunity-1", "application-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockOrganizationProfileRepository.findByUserId,
      ).toHaveBeenCalledWith("user-1");

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when opportunity is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        null,
      );

      await expect(
        service.analyzeApplicant("user-1", "opportunity-1", "application-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).toHaveBeenCalledWith("opportunity-1", "org-1");

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when submitted applicant data is not found", async () => {
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
        service.analyzeApplicant("user-1", "opportunity-1", "application-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).toHaveBeenCalledWith("application-1");
    });

    it("should throw NotFoundException when application belongs to another opportunity", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        {
          id: "application-1",
          studentProfile: {
            userId: "user-1",
          },
          opportunity: {
            id: "another-opportunity",
          },
        },
      );

      await expect(
        service.analyzeApplicant("user-1", "opportunity-1", "application-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockAssessmentsRepository.getSubmittedApplicantAnalysisData,
      ).toHaveBeenCalledWith("application-1");
    });

    it("should throw NotFoundException when submitted assessment attempt is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        {
          id: "application-1",
          studentProfile: {
            userId: "user-1",
          },
          opportunity: {
            id: "opportunity-1",
          },
          assessmentAttempt: null,
        },
      );

      await expect(
        service.analyzeApplicant("user-1", "opportunity-1", "application-1"),
      ).rejects.toThrow(NotFoundException);

      expect(mockCvsService.getCvTextForStudent).not.toHaveBeenCalled();
    });

    it("should analyze an applicant and save the assessment result", async () => {
      const submittedApplicantData = {
        id: "application-1",

        studentProfile: {
          userId: "user-1",
          academicYear: 3,
          university: "Unity University",
          fieldOfStudy: "Computer Science",
          location: "Addis Ababa",
          careerGoals: "Software Engineering",
          careerGoalTags: ["software"],
          interests: ["technology"],

          skills: [
            {
              skill: {
                name: "TypeScript",
                category: "Programming",
              },
              proficiency: "ADVANCED",
              yearsOfExperience: 2,
            },
          ],

          experiences: [
            {
              title: "Backend Developer Intern",
              organizationName: "Tech Company",
              experienceType: "INTERNSHIP",
              startDate: new Date("2025-01-01"),
              endDate: new Date("2025-06-01"),
              location: "Addis Ababa",
              description: "Worked on backend APIs.",
            },
          ],

          cvs: [
            {
              fileName: "cv.pdf",
              filePath: "/cvs/cv.pdf",
              fileType: "application/pdf",
              isDefault: true,
              uploadedAt: new Date("2025-01-01"),
            },
          ],
        },

        opportunity: {
          id: "opportunity-1",
          title: "Software Engineering Internship",
          description: "Backend development internship.",
          opportunityType: "INTERNSHIP",
          location: "Addis Ababa",
          isRemote: false,
          minimumAcademicYear: 3,
          maximumAcademicYear: 5,
          minimumGpa: 3.0,
          eligibleFields: ["Computer Science"],

          skills: [
            {
              skill: {
                name: "TypeScript",
                category: "Programming",
              },
              requirementLevel: "REQUIRED",
            },
          ],
        },

        assessmentAttempt: {
          id: "attempt-1",

          assessment: {
            questions: [
              {
                id: "question-1",
                questionText: "Explain TypeScript.",
                questionType: "TEXT",
                questionOrder: 1,
                options: null,
                referenceAnswer: null,
                evaluationGuidance: null,
                requirementLevel: null,
              },
            ],
          },

          answers: [
            {
              assessmentQuestionId: "question-1",
              answerText: "TypeScript is a typed superset of JavaScript.",
              question: {
                questionText: "Explain TypeScript.",
                questionOrder: 1,
              },
            },
          ],
        },
      };

      const cvText = "Experienced software developer with TypeScript skills.";

      const analysis = {
        overallScore: 85,
        requirementMatch: 90,
        skillAnalysis: {
          TypeScript: "Strong",
        },
        strengths: ["TypeScript experience"],
        gaps: ["Limited professional experience"],
        summary: "Strong candidate with relevant technical skills.",
      };

      const savedResult = {
        ...assessmentResult,
        aiScore: 85,
        aiRequirementMatch: 90,
      };

      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.getSubmittedApplicantAnalysisData.mockResolvedValue(
        submittedApplicantData,
      );

      mockCvsService.getCvTextForStudent.mockResolvedValue(cvText);

      mockAIApplicantAnalysisService.analyzeApplicant.mockResolvedValue(
        analysis,
      );

      mockAssessmentsRepository.saveAssessmentResult.mockResolvedValue(
        savedResult,
      );

      const result = await service.analyzeApplicant(
        "user-1",
        "opportunity-1",
        "application-1",
      );

      expect(
        mockAIApplicantAnalysisService.analyzeApplicant,
      ).toHaveBeenCalled();

      expect(
        mockAssessmentsRepository.saveAssessmentResult,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          assessmentAttemptId: "attempt-1",
          aiScore: 85,
          aiRequirementMatch: 90,
          aiStrengths: ["TypeScript experience"],
          aiGaps: ["Limited professional experience"],
          aiSummary: "Strong candidate with relevant technical skills.",
          aiSkillAnalysis: {
            TypeScript: "Strong",
          },
        }),
      );

      expect(result).toEqual({
        applicationId: "application-1",
        opportunityId: "opportunity-1",
        analysis,
        result: savedResult,
      });
    });
  });

  describe("saveAssessmentResult", () => {
    it("should save an assessment result", async () => {
      const resultData = {
        assessmentAttemptId: "attempt-1",
        aiScore: 85,
        aiRequirementMatch: "90",
        aiStrengths: ["TypeScript experience"],
        aiGaps: ["Limited professional experience"],
        aiSummary: "Strong candidate.",
        aiEvaluatedAt: new Date(),
      };

      mockAssessmentsRepository.saveAssessmentResult.mockResolvedValue(
        assessmentResult,
      );

      const result = await service.saveAssessmentResult(resultData);

      expect(
        mockAssessmentsRepository.saveAssessmentResult,
      ).toHaveBeenCalledWith(resultData);

      expect(result).toEqual(assessmentResult);
    });
  });

  describe("getAssessmentResultById", () => {
    it("should get an assessment result by ID", async () => {
      mockAssessmentsRepository.findAssessmentResultById.mockResolvedValue(
        assessmentResult,
      );

      const result = await service.getAssessmentResultById("result-1");

      expect(
        mockAssessmentsRepository.findAssessmentResultById,
      ).toHaveBeenCalledWith("result-1");

      expect(result).toEqual(assessmentResult);
    });
  });

  describe("getAssessmentResultByAttemptId", () => {
    it("should get an assessment result by attempt ID", async () => {
      mockAssessmentsRepository.findAssessmentResultByAttemptId.mockResolvedValue(
        assessmentResult,
      );

      const result = await service.getAssessmentResultByAttemptId("attempt-1");

      expect(
        mockAssessmentsRepository.findAssessmentResultByAttemptId,
      ).toHaveBeenCalledWith("attempt-1");

      expect(result).toEqual(assessmentResult);
    });
  });

  describe("getAssessmentResultByApplicationId", () => {
    it("should get an assessment result by application ID", async () => {
      mockAssessmentsRepository.findAssessmentResultByApplicationId.mockResolvedValue(
        assessmentResult,
      );

      const result =
        await service.getAssessmentResultByApplicationId("application-1");

      expect(
        mockAssessmentsRepository.findAssessmentResultByApplicationId,
      ).toHaveBeenCalledWith("application-1");

      expect(result).toEqual(assessmentResult);
    });
  });

  describe("getAssessmentResultsByOpportunity", () => {
    it("should throw NotFoundException when organization membership is not found", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.getAssessmentResultsByOpportunity("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockOrganizationProfileRepository.findByUserId,
      ).toHaveBeenCalledWith("user-1");

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when organization is deleted", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue({
        ...organizationMembership,
        organization: {
          ...organizationMembership.organization,
          deletedAt: new Date(),
        },
      });

      await expect(
        service.getAssessmentResultsByOpportunity("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when opportunity is not owned by the organization", async () => {
      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        null,
      );

      await expect(
        service.getAssessmentResultsByOpportunity("user-1", "opportunity-1"),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).toHaveBeenCalledWith("opportunity-1", "org-1");

      expect(
        mockAssessmentsRepository.findAssessmentResultsByOpportunityId,
      ).not.toHaveBeenCalled();
    });

    it("should get assessment results for an organization opportunity", async () => {
      const results = [assessmentResult];

      const options = {
        minScore: 70,
        sortBy: "finalScore",
        sortOrder: "desc",
        page: 1,
        limit: 10,
      };

      mockOrganizationProfileRepository.findByUserId.mockResolvedValue(
        organizationMembership,
      );

      mockOpportunitiesRepository.findByIdAndOrganizationId.mockResolvedValue(
        opportunity,
      );

      mockAssessmentsRepository.findAssessmentResultsByOpportunityId.mockResolvedValue(
        results,
      );

      const result = await service.getAssessmentResultsByOpportunity(
        "user-1",
        "opportunity-1",
        options,
      );

      expect(
        mockOrganizationProfileRepository.findByUserId,
      ).toHaveBeenCalledWith("user-1");

      expect(
        mockOpportunitiesRepository.findByIdAndOrganizationId,
      ).toHaveBeenCalledWith("opportunity-1", "org-1");

      expect(
        mockAssessmentsRepository.findAssessmentResultsByOpportunityId,
      ).toHaveBeenCalledWith("opportunity-1", options);

      expect(result).toEqual(results);
    });

    it("should reject starting an assessment attempt for another student", async () => {
      mockApplicationsRepository.findById.mockResolvedValue({
        studentProfile: {
          user: {
            id: "another-user",
          },
        },
      });

      await expect(
        service.startAttempt("user-1", {
          applicationId: "application-1",
          assessmentId: "assessment-1",
        }),
      ).rejects.toThrow(
        "You are not authorized to start an assessment for this application.",
      );

      expect(mockAssessmentsRepository.createAttempt).not.toHaveBeenCalled();
    });

    it("should reject access to another student’s assessment attempt", async () => {
      mockAssessmentsRepository.findAttemptByIdWithAnswers.mockResolvedValue({
        ...attempt,
        application: {
          studentProfile: {
            user: {
              id: "another-user",
            },
          },
        },
        answers: [],
      });

      await expect(
        service.getAttemptWithAnswers("user-1", "attempt-1"),
      ).rejects.toThrow(
        "You are not authorized to access this assessment attempt.",
      );
    });

    it("should reject saving an answer for another student’s attempt", async () => {
      mockAssessmentsRepository.findAttemptByIdWithAnswers.mockResolvedValue({
        ...attempt,
        application: {
          studentProfile: {
            user: {
              id: "another-user",
            },
          },
        },
      });

      await expect(
        service.saveAnswer("user-1", {
          assessmentAttemptId: "attempt-1",
          assessmentQuestionId: "question-1",
          answerText: "Unauthorized answer",
        }),
      ).rejects.toThrow(
        "You are not authorized to answer this assessment attempt.",
      );

      expect(mockAssessmentsRepository.saveAnswer).not.toHaveBeenCalled();
    });

    it("should reject saving answers for another student’s attempt", async () => {
      mockAssessmentsRepository.findAttemptByIdWithAnswers.mockResolvedValue({
        ...attempt,
        application: {
          studentProfile: {
            user: {
              id: "another-user",
            },
          },
        },
      });

      const answers = [
        {
          assessmentQuestionId: "question-1",
          answerText: "My answer",
        },
      ];

      await expect(
        service.saveAnswers("user-1", "attempt-1", answers),
      ).rejects.toThrow(ForbiddenException);

      expect(mockAssessmentsRepository.saveAnswers).not.toHaveBeenCalled();
    });
  });
});
