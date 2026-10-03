import type { IconName } from '../components/ui/Icon'
import type { ActiveOpening, RecentApplicant } from '../types/organization'


export const ORG_NAME = 'Stanford Tech Lab'
export const ORG_ROLE = 'Partner Organization'
export const ASSESSMENTS_TODAY = 12

export const ORG_NAV: { label: string; title: string; to: string; icon: IconName; end?: boolean }[] = [
  { label: 'Dashboard', title: 'Overview', to: '/organization', icon: 'dashboard', end: true },
  { label: 'My Opportunities', title: 'My Opportunities', to: '/organization/opportunities', icon: 'briefcase' },
  { label: 'Applicants', title: 'Applicant Hub', to: '/organization/applicants', icon: 'users' },  { label: 'Profile', title: 'Profile', to: '/organization/profile', icon: 'user' },
{ label: 'AI Assessment', title: 'AI Assessment', to: '/organization/assessment', icon: 'sparkles' },
  { label: 'Notifications', title: 'Notifications', to: '/organization/notifications', icon: 'bell' },
  { label: 'Settings', title: 'Settings', to: '/organization/settings', icon: 'settings' },
]

export const ORG_STATS: { label: string; value: number; note: string; icon: IconName }[] = [
  { label: 'Active Opportunities', value: 5, note: '+1 this week', icon: 'briefcase' },
  { label: 'Total Applicants', value: 47, note: '+12 this week', icon: 'users' },
  { label: 'Recently Accepted', value: 4, note: '+2 this week', icon: 'check' },
  { label: 'Assessments Completed', value: 12, note: '88% rate', icon: 'clipboard' },
]

export const RECENT_APPLICANTS: RecentApplicant[] = [
  { id: '1', name: 'Alex Mercer', initials: 'AM', position: 'AI Software Eng. Intern', match: 96, status: 'Under Review' },
  { id: '2', name: 'Sarah Ko', initials: 'SK', position: 'Frontend Developer', match: 91, status: 'Interview' },
  { id: '3', name: 'Tony Ross', initials: 'TR', position: 'UI/UX Design Intern', match: 84, status: 'Shortlisted' },
]

export const ACTIVE_OPENINGS: ActiveOpening[] = [
  { id: '1', title: 'AI Software Engineering Intern', applicants: 24, deadline: 'Oct 15', urgent: true },
  { id: '2', title: 'Frontend Developer (Copilot)', applicants: 15, deadline: 'Oct 20' },
]

export const ACTIVE_OPENINGS_TOTAL = 5

import type { PostOpportunityFormState } from '../types/organization'

export const OPPORTUNITY_TYPES = ['Internship', 'Full-time', 'Part-time', 'Fellowship', 'Co-op']
export const EDUCATION_LEVELS = ['High School', 'Undergraduate Freshman', 'Undergraduate Junior', 'Undergraduate Senior', 'Graduate']
export const EXPERIENCE_LEVELS = ['No Experience', 'Beginner (0-1 Years)', 'Intermediate (1+ Years projects)', 'Advanced (2+ Years)']

export const DEFAULT_OPPORTUNITY_FORM: PostOpportunityFormState = {
  title: '',
  type: '',
  description: '',
  location: '',
  field: '',
  requiredSkills: [],
  preferredSkills: [],
  educationLevel: '',
  experienceLevel: '',
  responsibilities: '',
  applicationDeadline: '',
  maxApplicants: '',
}

import type { OpportunityHistoryItem } from '../types/organization'

export const OPPORTUNITY_HISTORY: OpportunityHistoryItem[] = [
  { id: '1', title: 'AI Software Engineering Intern', type: 'Internship', applicants: 24, postedDate: 'Sep 2, 2026', status: 'Active' },
  { id: '2', title: 'Frontend Developer (Copilot Team)', type: 'Full-time', applicants: 15, postedDate: 'Aug 21, 2026', status: 'Active' },
  { id: '3', title: 'Product Design Intern', type: 'Internship', applicants: 42, postedDate: 'Jul 30, 2026', status: 'Closed' },
  { id: '4', title: 'Data Analytics Co-op', type: 'Co-op', applicants: 9, postedDate: 'Jul 12, 2026', status: 'Closed' },
  { id: '5', title: 'Summer Research Fellowship', type: 'Fellowship', applicants: 0, postedDate: 'Jun 28, 2026', status: 'Draft' },
]

import type { ApplicantListItem, ApplicantProfileDetail } from '../types/organization'

export const APPLICANTS_OPPORTUNITY_TITLE = 'AI Software Engineering Intern'

export const APPLICANT_STATS = {
  total: 23,
  shortlisted: 5,
  inAssessment: 3,
  accepted: 2,
}

export const APPLICANTS: ApplicantListItem[] = [
  { id: '1', name: 'Alex Mercer', initials: 'AM', matchScore: 96, matchTier: 'Excellent Fit', skillsMatch: 98, status: 'Under Review', dateApplied: 'Sep 28, 2026' },
  { id: '2', name: 'Sarah Ko', initials: 'SK', matchScore: 91, matchTier: 'High Fit', skillsMatch: 92, status: 'Interview', dateApplied: 'Sep 24, 2026' },
  { id: '3', name: 'Tony Ross', initials: 'TR', matchScore: 84, matchTier: 'Good Fit', skillsMatch: 85, status: 'Shortlisted', dateApplied: 'Sep 20, 2026' },
]

export const APPLICANT_PROFILES: Record<string, ApplicantProfileDetail> = {
  '1': {
    id: '1',
    name: 'Alex Mercer',
    initials: 'AM',
    year: 'Senior Year (2026)',
    university: 'Stanford University',
    track: 'Computer Science (AI Track)',
    biography:
      'Builder at heart with a focus on developer tools and AI infrastructure. Enjoys turning ambiguous problems into clean, shippable systems.',
    technicalSkills: ['Python', 'TypeScript', 'PyTorch', 'React', 'PostgreSQL'],
    experienceTitle: 'Software Engineering Intern',
    experienceCompany: 'Scale AI',
    experiencePeriod: 'Summer 2026',
    careerGoals: 'Aims to work on foundational AI infrastructure at a research-driven engineering team.',
    timeline: [
      { id: 't1', label: 'Applied to Role', date: 'Sep 28, 2026', done: true },
      { id: 't2', label: 'Application Reviewed', date: 'Sep 30, 2026', done: true },
      { id: 't3', label: 'AI Assessment Scored', date: 'Oct 1, 2026', done: true },
      { id: 't4', label: 'Interview Scheduled', date: 'Set for Oct 10, 2026', done: false },
    ],
  },
  '2': {
    id: '2',
    name: 'Sarah Ko',
    initials: 'SK',
    year: 'Senior Year (2026)',
    university: 'Stanford University',
    track: 'Computer Science (UI/UX Track)',
    biography:
      'Aspiring product engineer with a strong track record of crafting user-centric frontend experiences. Deeply passionate about the intersection of artificial intelligence and interactive tools.',
    technicalSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Figma', 'UI/UX Prototyping'],
    experienceTitle: 'Frontend Engineering Intern',
    experienceCompany: 'Vercel',
    experiencePeriod: 'Summer 2025',
    careerGoals:
      'Aims to become a full-time Full Stack Developer, contributing directly to generative coding products and workspace collaboration tools.',
    timeline: [
      { id: 't1', label: 'Applied to Role', date: 'Oct 1, 2026', done: true },
      { id: 't2', label: 'Application Reviewed', date: 'Oct 3, 2026', done: true },
      { id: 't3', label: 'AI Assessment Scored', date: 'Oct 4, 2026', done: true },
      { id: 't4', label: 'Interview Scheduled', date: 'Set for Oct 12, 2026', done: false },
    ],
  },
  '3': {
    id: '3',
    name: 'Tony Ross',
    initials: 'TR',
    year: 'Junior Year (2027)',
    university: 'Stanford University',
    track: 'Human-Computer Interaction',
    biography:
      'Design-minded engineer who enjoys prototyping quickly and validating ideas with real users before writing production code.',
    technicalSkills: ['Figma', 'React', 'TypeScript', 'A/B Testing'],
    experienceTitle: 'Product Design Intern',
    experienceCompany: 'Notion',
    experiencePeriod: 'Summer 2025',
    careerGoals: 'Aims to work at the intersection of product design and frontend engineering.',
    timeline: [
      { id: 't1', label: 'Applied to Role', date: 'Sep 20, 2026', done: true },
      { id: 't2', label: 'Application Reviewed', date: 'Sep 22, 2026', done: true },
      { id: 't3', label: 'AI Assessment Scored', date: 'Sep 24, 2026', done: false },
      { id: 't4', label: 'Interview Scheduled', date: 'Not yet scheduled', done: false },
    ],
  },
}

import type { AssessmentEvaluation } from '../types/organization'

export const ASSESSMENT_EVALUATIONS: Record<string, AssessmentEvaluation> = {
  '1': {
    applicantId: '1',
    applicantName: 'Alex Mercer',
    initials: 'AM',
    university: 'Stanford University',
    degree: 'M.S. Computer Science',
    matchScore: 84,
    recommendationLabel: 'Highly Recommended',
    breakdown: [
      { label: 'Skills Match', value: 90 },
      { label: 'Profile Match', value: 85 },
      { label: 'CV Match', value: 82 },
      { label: 'Technical Test', value: 80 },
      { label: 'Experience Alignment', value: 78 },
    ],
    keyStrengths: [
      'Strong Node.js knowledge with scalable architecture experience',
      'Good REST API understanding and solid routing principles',
      'PostgreSQL experience with production indexing',
    ],
    areasToImprove: ['Limited commercial production environment experience'],
    summary:
      'Alex is a highly competitive candidate displaying remarkable algorithmic strength. We recommend shortlisting for the final interview phase based on exceptional Node.js benchmarks.',
  },
  '2': {
    applicantId: '2',
    applicantName: 'Sarah Ko',
    initials: 'SK',
    university: 'Stanford University',
    degree: 'B.S. Computer Science',
    matchScore: 91,
    recommendationLabel: 'Highly Recommended',
    breakdown: [
      { label: 'Skills Match', value: 94 },
      { label: 'Profile Match', value: 92 },
      { label: 'CV Match', value: 89 },
      { label: 'Technical Test', value: 88 },
      { label: 'Experience Alignment', value: 85 },
    ],
    keyStrengths: [
      'Excellent frontend architecture and component design skills',
      'Strong portfolio showing production-grade UI work',
      'Fast, clean implementation in the timed technical test',
    ],
    areasToImprove: ['Limited exposure to backend or infrastructure work'],
    summary:
      'Sarah performed exceptionally well across every stage of the assessment. Her frontend engineering skills and design sense make her a strong fit for the Frontend Developer role.',
  },
  '3': {
    applicantId: '3',
    applicantName: 'Tony Ross',
    initials: 'TR',
    university: 'Stanford University',
    degree: 'B.S. Human-Computer Interaction',
    matchScore: 76,
    recommendationLabel: 'Recommended',
    breakdown: [
      { label: 'Skills Match', value: 80 },
      { label: 'Profile Match', value: 78 },
      { label: 'CV Match', value: 74 },
      { label: 'Technical Test', value: 70 },
      { label: 'Experience Alignment', value: 72 },
    ],
    keyStrengths: [
      'Strong prototyping speed and visual design instincts',
      'Clear, well-organized design rationale in submitted work',
    ],
    areasToImprove: [
      'Technical test scores lower than peers for this role',
      'Limited experience with production React codebases',
    ],
    summary:
      "Tony shows strong design fundamentals but is earlier in his technical journey than other candidates. Worth a conversation to gauge growth trajectory before deciding.",
  },
}

import type { OrganizationProfileFormState } from '../types/organization'

export const ORG_LAST_UPDATED = 'Last updated 3 days ago'

export const DEFAULT_ORG_PROFILE: OrganizationProfileFormState = {
  name: '',
  industry: '',
  website: '',
  headquarters: '',
  teamSize: '',
  about: '',
  focusAreas: [],
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
  linkedin: '',
  twitter: '',
  logoFileName: null,
}

import type { NotificationPreference, TeamMember } from '../types/organization'

export const ACCOUNT_EMAIL = 'hiring@stanfordtechlab.com'

export const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Jordan Lee', initials: 'JL', email: 'hiring@stanfordtechlab.com', role: 'Admin' },
  { id: '2', name: 'Maria Park', initials: 'MP', email: 'm.park@stanfordtechlab.com', role: 'Member' },
]

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreference[] = [
  { id: 'new-applicant', label: 'New applicant alerts', description: 'Get notified when a student applies', enabled: true },
  { id: 'assessment-done', label: 'AI assessment completed', description: 'Alerts when scoring finishes', enabled: true },
  { id: 'weekly-summary', label: 'Weekly summary email', description: 'A digest of pipeline activity', enabled: false },
  { id: 'product-updates', label: 'Product updates', description: 'News about new Opportunity Hub features', enabled: false },
]

import type { NotificationItem } from '../types/organization'

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    category: 'applicant',
    icon: 'userPlus',
    iconStyle: 'bg-amber-100 text-amber-600',
    title: 'New applicant: Alex Mercer',
    description: 'Applied to AI Software Engineering Intern. AI Match Score: 96%.',
    time: '2h ago',
    read: false,
    link: '/organization/applicants/1',
  },
  {
    id: '2',
    category: 'assessment',
    icon: 'sparkles',
    iconStyle: 'bg-blue-100 text-blue-600',
    title: 'AI assessment completed',
    description: "Sarah Ko's evaluation is ready to review. Overall score: 91%.",
    time: '5h ago',
    read: false,
    link: '/organization/applicants/2/assessment',
  },
  {
    id: '3',
    category: 'applicant',
    icon: 'calendarEvent',
    iconStyle: 'bg-emerald-100 text-emerald-600',
    title: 'Interview scheduled',
    description: 'Interview with Sarah Ko set for Oct 12, 2026.',
    time: '1d ago',
    read: false,
    link: '/organization/applicants/2',
  },
  {
    id: '4',
    category: 'system',
    icon: 'clock',
    iconStyle: 'bg-slate-100 text-slate-600',
    title: 'Deadline approaching',
    description: '"Frontend Developer (Copilot Team)" closes applications in 3 days.',
    time: '1d ago',
    read: false,
    link: '/organization/opportunities',
  },
  {
    id: '5',
    category: 'applicant',
    icon: 'userPlus',
    iconStyle: 'bg-amber-100 text-amber-600',
    title: 'New applicant: Tony Ross',
    description: 'Applied to UI/UX Design Intern. AI Match Score: 84%.',
    time: '3d ago',
    read: true,
    link: '/organization/applicants/3',
  },
  {
    id: '6',
    category: 'system',
    icon: 'settings',
    iconStyle: 'bg-slate-100 text-slate-600',
    title: 'Profile updated',
    description: 'Your organization profile changes were saved successfully.',
    time: '5d ago',
    read: true,
  },
]