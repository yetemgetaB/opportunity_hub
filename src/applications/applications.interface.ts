import {
  ApplicationStatus,
  Prisma,
} from '@prisma/client';

export interface CreateApplicationData {
  studentProfileId: string;
  opportunityId: string;
  status?: ApplicationStatus;
}

export interface UpdateApplicationStatusData {
  status: ApplicationStatus;
}

export interface ApplicationFilterOptions {
  studentProfileId?: string;
  opportunityId?: string;
  organizationId?: string;
  status?: ApplicationStatus;
  skip?: number;
  take?: number;
  orderBy?: Prisma.ApplicationOrderByWithRelationInput;
}

export interface SavedOpportunityFilterOptions {
  studentProfileId?: string;
  opportunityId?: string;
  skip?: number;
  take?: number;
}

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    studentProfile: {
      include: {
        user: true;
        skills: {
          include: {
            skill: true;
          };
        };
      };
    };
    opportunity: {
      include: {
        organization: true;
        skills: {
          include: {
            skill: true;
          };
        };
      };
    };
    assessmentAttempt: true;
  };
}>;

export const applicantIncludes = Prisma.validator<Prisma.ApplicationInclude>()({
  studentProfile: {
    include: {
      user: true,
      skills: {
        include: {
          skill: true,
        },
      },
      experiences: {
        orderBy: {
          startDate: 'desc',
        },
      },
      cvs: {
        orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
      },
    },
  },
  opportunity: {
    include: {
      organization: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
  },
  assessmentAttempt: true,
});

export type ApplicantWithRelations = Prisma.ApplicationGetPayload<{
  include: typeof applicantIncludes;
}>;

export type SavedOpportunityWithRelations = Prisma.SavedOpportunityGetPayload<{
  include: {
    opportunity: {
      include: {
        organization: true;
        skills: {
          include: {
            skill: true;
          };
        };
      };
    };
    studentProfile: {
      include: {
        user: true;
      };
    };
  };
}>;
