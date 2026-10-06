export interface ApplicantAnalysisInput {
  applicantId: string;
  applicationId: string;
  opportunityId: string;

  applicant: {
    profile: {
      academicYear: number;
      university: string;
      fieldOfStudy: string;
      location: string | null;
      careerGoals: string | null;
      careerGoalTags: string[];
      interests: string[];
    };

    skills: Array<{
      name: string;
      category: string;
      proficiency: number;
      yearsOfExperience: number | null;
    }>;

    experiences: Array<{
      title: string;
      organizationName: string;
      experienceType: string;
      startDate: Date;
      endDate: Date | null;
      location: string | null;
      description: string | null;
    }>;

    cvs: Array<{
      fileName: string;
      filePath: string;
      fileType: string;
      isDefault: boolean;
      uploadedAt: Date;
    }>;

    cvText: string | null;
  };

  opportunity: {
    title: string;
    description: string;
    opportunityType: string;
    location: string | null;
    isRemote: boolean;

    minimumAcademicYear: number | null;
    maximumAcademicYear: number | null;
    minimumGpa: number | null;
    eligibleFields: string[];

    requiredSkills: Array<{
      name: string;
      category: string;
      requirementLevel: string;
    }>;
  };

  assessment: {
    questions: Array<{
      id: string;
      questionText: string;
      questionType: string;
      questionOrder: number;
      options: unknown;
      referenceAnswer: string | null;
      evaluationGuidance: string | null;
      requirementLevel: string;
    }>;

    answers: Array<{
      questionId: string;
      questionText: string;
      answerText: string;
      questionOrder: number;
    }>;
  };
}

export interface ApplicantAnalysisOutput {
  applicantId: string;
  applicationId: string;
  opportunityId: string;

  overallScore: number | null;
  requirementMatch: string | null;

  skillAnalysis: unknown;

  strengths: string[];
  gaps: string[];

  summary: string | null;
}