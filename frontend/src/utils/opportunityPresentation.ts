import type { Opportunity } from '../types/student'
import type { OpportunitySearchResult, PublicOpportunity } from '../types/opportunity'

export function toStudentOpportunity(item: PublicOpportunity): Opportunity {
  const organization = typeof item.organization === 'string'
    ? item.organization
    : item.organization?.name ?? 'Organization'
  const skillTags = (item.skills ?? []).map((entry) => entry.skill?.name ?? entry.name).filter((name): name is string => Boolean(name))
  const tags = skillTags.length ? skillTags : item.eligibleFields ?? []
  return {
    id: item.id,
    company: organization,
    location: item.location ?? (item.isRemote ? 'Remote' : 'Location not specified'),
    tagline: item.isRemote ? 'Remote opportunity' : item.location ?? 'Opportunity',
    title: item.title,
    description: item.description ?? '',
    tags,
    type: item.opportunityType ?? 'OTHER',
    fieldsOfStudy: item.eligibleFields ?? [],
    deadline: item.applicationDeadline ?? '',
    overview: item.description ?? '',
    requirements: tags,
    benefits: [],
    matchBreakdown: [],
  }
}

export function toStudentOpportunitySearch(item: OpportunitySearchResult): Opportunity {
  const tags = [...item.skills, ...item.eligibleFields]
  return {
    id: item.id,
    company: item.organization?.name ?? 'Verified Partner',
    location: item.location ?? (item.isRemote ? 'Remote' : 'Location not specified'),
    tagline: item.isRemote ? 'Remote opportunity' : item.location ?? 'Opportunity',
    title: item.title,
    description: item.description ?? '',
    tags,
    type: item.opportunityType,
    fieldsOfStudy: item.eligibleFields,
    deadline: item.applicationDeadline ?? '',
    overview: item.description ?? '',
    requirements: item.skills,
  }
}
