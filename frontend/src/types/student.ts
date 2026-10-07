export interface Opportunity {
  id: string
  company: string
  location: string
  tagline: string
  title: string
  description: string
  tags: string[]
  type: string
  fieldsOfStudy?: string[]
  deadline: string
  overview: string
  requirements: string[]
  benefits?: string[]
  matchBreakdown?: string[]
  createdAt?: string
  publishedAt?: string | null
}

export interface Deadline {
  id: string
  title: string
  company: string
  location: string
  type: string
  due: string
  status: string
  urgent?: boolean
}

export interface ActivityItem {
  id: string
  icon: 'file' | 'sparkles' | 'bookmark'
  title: string
  time: string
  text: string
}
