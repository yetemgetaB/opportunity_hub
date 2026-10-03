import type { ApplicationItem, ApplicationStatus } from '../types/application'

const PREVIOUS_STATUSES: ApplicationStatus[] = ['Accepted', 'Rejected', 'Withdrawn']

export function isPrevious(status: ApplicationStatus) {
  return PREVIOUS_STATUSES.includes(status)
}

// TODO: replace this mock data with a real API call (services/applicationService)
export const APPLICATIONS: ApplicationItem[] = [
  // Active
  { id: '1', title: 'Frontend Engineer Core', company: 'Vercel', location: 'Remote (US)', appliedDate: 'Sep 27, 2026', matchScore: 89, status: 'Under Review', opportunityId: '2' },
  { id: '2', title: 'AI Software Engineering Intern', company: 'Apple', location: 'Cupertino, CA', appliedDate: 'Sep 24, 2026', matchScore: 92, status: 'Interview' },
  { id: '3', title: 'Frontend Developer (Copilot Team)', company: 'GitHub', location: 'Remote', appliedDate: 'Sep 20, 2026', matchScore: 85, status: 'Shortlisted' },
  { id: '4', title: 'Product Design Intern', company: 'Stripe', location: 'San Francisco, CA', appliedDate: 'Sep 18, 2026', matchScore: 94, status: 'Interview', opportunityId: '1' },
  { id: '5', title: 'Design Engineer Intern', company: 'Figma', location: 'San Francisco, CA', appliedDate: 'Sep 15, 2026', matchScore: 88, status: 'Under Review' },
  { id: '6', title: 'Data Science Intern', company: 'Airbnb', location: 'Remote', appliedDate: 'Sep 12, 2026', matchScore: 81, status: 'Interview' },
  { id: '7', title: 'Frontend Developer Intern', company: 'Shopify', location: 'Remote (Canada)', appliedDate: 'Sep 9, 2026', matchScore: 84, status: 'Under Review' },
  { id: '8', title: 'ML Engineering Intern', company: 'Databricks', location: 'San Francisco, CA', appliedDate: 'Sep 5, 2026', matchScore: 79, status: 'Shortlisted' },
  // Previous
  { id: '9', title: 'Data Analytics Co-op', company: 'Linear', location: 'San Francisco, CA', appliedDate: 'Aug 12, 2026', matchScore: 90, status: 'Accepted' },
  { id: '10', title: 'Core Systems Engineer Intern', company: 'Notion', location: 'San Francisco, CA', appliedDate: 'Aug 3, 2026', matchScore: 78, status: 'Rejected' },
  { id: '11', title: 'AI Operations Associate', company: 'Scale AI', location: 'San Francisco, CA', appliedDate: 'Jul 22, 2026', matchScore: 72, status: 'Withdrawn', opportunityId: '3' },
  { id: '12', title: 'Backend Engineer Intern', company: 'Coinbase', location: 'Remote', appliedDate: 'Jul 10, 2026', matchScore: 70, status: 'Rejected' },
]