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
