import { OpportunityWithRelations } from './opportunities.interface';

export function mapOpportunityForSearch(opportunity: OpportunityWithRelations) {
  return {
    id: opportunity.id,
    title: opportunity.title,
    skills: (opportunity.skills ?? []).map(
      (item) => item.skill?.name ?? item.skillId,
    ),
    eligibleFields: opportunity.eligibleFields,
    location: opportunity.location,
    opportunityType: opportunity.opportunityType,
    isRemote: opportunity.isRemote,
  };
}

export function mapOpportunityForDetails(opportunity: OpportunityWithRelations) {
  return {
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    skills: (opportunity.skills ?? []).map((item) => ({
      skillId: item.skillId,
      name: item.skill?.name,
      requirementLevel: item.requirementLevel,
    })),
    eligibleFields: opportunity.eligibleFields,
    location: opportunity.location,
    isRemote: opportunity.isRemote,
    opportunityType: opportunity.opportunityType,
    applicationDeadline: opportunity.applicationDeadline,
    minimumAcademicYear: opportunity.minimumAcademicYear,
    maximumAcademicYear: opportunity.maximumAcademicYear,
    minimumGpa: opportunity.minimumGpa,
    compensation: opportunity.compensation,
    applicationUrl: opportunity.applicationUrl,
    organization: opportunity.organization
      ? {
          id: opportunity.organization.id,
          name: opportunity.organization.name,
          description: opportunity.organization.description,
          websiteUrl: opportunity.organization.websiteUrl,
        }
      : undefined,
  };
}