import { OpportunityType } from '@prisma/client';

export interface OpportunitySearchCriteria {
  keyword?: string;
  field?: string;
  location?: string;
  skills?: string;
  type?: OpportunityType;
  isRemote?: boolean;
  minimumAcademicYear?: number;
  maximumAcademicYear?: number;
}