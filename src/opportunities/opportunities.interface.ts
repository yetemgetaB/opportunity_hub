import {
  OpportunityStatus,
  OpportunityType,
  Prisma,
  SkillRequirementLevel,
} from '@prisma/client';

export interface OpportunitySkillInput {
  skillId: string;
  requirementLevel?: SkillRequirementLevel;
}

export interface CreateOpportunityData {
  organizationId: string;
  title: string;
  description: string;
  opportunityType: OpportunityType;
  status?: OpportunityStatus;
  location?: string | null;
  isRemote?: boolean;
  applicationDeadline?: Date | string | null;
  minimumAcademicYear?: number | null;
  maximumAcademicYear?: number | null;
  minimumGpa?: number | Prisma.Decimal | null;
  eligibleFields?: string[];
  compensation?: string | null;
  applicationUrl?: string | null;
  publishedAt?: Date | string | null;
  skills?: OpportunitySkillInput[];
}

export interface UpdateOpportunityData {
  title?: string;
  description?: string;
  opportunityType?: OpportunityType;
  status?: OpportunityStatus;
  location?: string | null;
  isRemote?: boolean;
  applicationDeadline?: Date | string | null;
  minimumAcademicYear?: number | null;
  maximumAcademicYear?: number | null;
  minimumGpa?: number | Prisma.Decimal | null;
  eligibleFields?: string[];
  compensation?: string | null;
  applicationUrl?: string | null;
  publishedAt?: Date | string | null;
}

export interface OpportunityFilterOptions {
  keyword?: string;
  organizationId?: string;
  opportunityType?: OpportunityType;
  status?: OpportunityStatus;
  isRemote?: boolean;
  location?: string;
  eligibleFields?: string[];
  skillIds?: string[];
  minimumAcademicYear?: number;
  maximumAcademicYear?: number;
  hasActiveDeadline?: boolean;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
  orderBy?: Prisma.OpportunityOrderByWithRelationInput;
}

export type OpportunityWithRelations = Prisma.OpportunityGetPayload<{
  include: {
    organization: true;
    skills: {
      include: {
        skill: true;
      };
    };
  };
}>;

export type OpportunitySkillWithSkill = Prisma.OpportunitySkillGetPayload<{
  include: {
    skill: true;
  };
}>;

export type OpportunityApplicant = Prisma.ApplicationGetPayload<{
  select: {
    id: true;
    status: true;
    appliedAt: true;
    updatedAt: true;
    studentProfile: {
      select: {
        academicYear: true;
        university: true;
        fieldOfStudy: true;
        location: true;
        careerGoals: true;
        careerGoalTags: true;
        interests: true;
        user: {
          select: {
            id: true;
            firstName: true;
            middleName: true;
            lastName: true;
            avatarUrl: true;
          };
        };
        skills: {
          select: {
            proficiency: true;
            yearsOfExperience: true;
            skill: {
              select: {
                id: true;
                name: true;
                category: true;
                description: true;
              };
            };
          };
        };
        experiences: {
          select: {
            id: true;
            title: true;
            organizationName: true;
            experienceType: true;
            startDate: true;
            endDate: true;
            location: true;
            description: true;
          };
        };
        cvs: {
          select: {
            id: true;
            fileName: true;
            fileType: true;
            fileSize: true;
            isDefault: true;
            uploadedAt: true;
          };
        };
      };
    };
  };
}>;
