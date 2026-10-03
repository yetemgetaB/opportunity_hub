export type OpportunityType = 'Internship' | 'Fellowship' | 'Grant' | 'Scholarship'

export interface Opportunity {
  id: string
  title: string
  organization: string
  type: OpportunityType
  location: string
  deadline: string
}