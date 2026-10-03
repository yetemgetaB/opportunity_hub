import type { IconName } from '../components/ui/Icon'
import type { ActivityItem, Deadline, Opportunity } from '../types/student'
import type { StudentNotificationItem } from '../types/studentNotification'
import type { MonthlyApplications, ReportStat, SkillMatchTag, StatusFunnelStep } from '../types/studentReport'
import type { StudentNotificationPreference, StudentVisibilityPreference } from '../types/student'

export const STUDENT_NAME = 'Alex Mercer'
export const STUDENT_INSTITUTION = 'Stanford University'

export const STUDENT_NAV: { label: string; title: string; to: string; icon: IconName; end?: boolean }[] = [
  { label: 'Dashboard', title: 'Personal Overview', to: '/student', icon: 'dashboard', end: true },
  { label: 'Opportunities', title: 'Browse Opportunities', to: '/student/opportunities', icon: 'briefcase' },
  { label: 'Applications', title: 'Applications', to: '/student/applications', icon: 'folder' },
  { label: 'Saved', title: 'Saved', to: '/student/saved', icon: 'bookmark' },
  { label: 'Profile', title: 'Profile', to: '/student/profile', icon: 'user' },
  { label: 'Notifications', title: 'Notifications', to: '/student/notifications', icon: 'bell' },
  { label: 'Reports', title: 'Reports', to: '/student/reports', icon: 'clipboard' },
  { label: 'Settings', title: 'Settings', to: '/student/settings', icon: 'settings' },
]

export const STUDENT_STATS: { label: string; value: number | string; note: string; icon: IconName }[] = [
  { label: 'Applications', value: 12, note: '+3 this week', icon: 'folder' },
  { label: 'Interviews', value: 3, note: '2 scheduled', icon: 'video' },
  { label: 'AI Match Score', value: '87%', note: 'Highly Competitive', icon: 'gauge' },
  { label: 'Saved Jobs', value: 8, note: '1 deadline soon', icon: 'bookmark' },
]

// Single source of truth for every opportunity, used by both the dashboard's
// "Recommended for you" cards and the full Browse Opportunities list.
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    company: 'Stripe',
    location: 'San Francisco, CA',
    tagline: 'Payments infrastructure for the internet.',
    title: 'Product Design Intern',
    description:
      "We are looking for a Product Design Intern to join our Dashboard design team. You'll work closely with other designers, engineers, and product managers to craft tools that help millions of businesses start, run, and scale.",
    tags: ['Figma', 'SaaS', 'Design Systems'],
    type: 'Internship',
    fit: 94,
    deadline: 'October 15, 2026',
    overview:
      "We are looking for a Product Design Intern to join our Dashboard design team. You'll work closely with other designers, engineers, and product managers to craft tools that help millions of businesses start, run, and scale.",
    requirements: [
      'Enrolled in a relevant undergraduate or graduate program (Design, HCI, CS).',
      'Strong portfolio demonstrating system-oriented product design capabilities.',
      'High proficiency with Figma and modern vector-based design tooling.',
      'Basic understanding of frontend frameworks (React, HTML/CSS) is a big plus.',
      'Strong cross-functional communication and willingness to learn.',
    ],
    benefits: [
      'Competitive stipend and relocation support for onsite interns.',
      'Mentorship from senior product designers throughout the internship.',
      "Access to Stripe's internal design systems and tooling.",
      'Potential for a full-time return offer after graduation.',
      'Flexible hybrid schedule with a collaborative in-office culture.',
    ],
    matchBreakdown: [
      { label: 'Design Skills', value: 96 },
      { label: 'Tools & Tech', value: 92 },
      { label: 'Education Align', value: 88 },
    ],
    recommended: true,
  },
  {
    id: '2',
    company: 'Vercel',
    location: 'Remote (US)',
    tagline: 'The platform for frontend developers.',
    title: 'Frontend Engineer Core',
    description:
      "Join the Core team building the frameworks and infrastructure powering millions of websites. You'll ship features used by developers around the world.",
    tags: ['Next.js', 'React', 'TypeScript'],
    type: 'Full-time',
    fit: 89,
    deadline: 'November 3, 2026',
    overview:
      "Join the Core team building the frameworks and infrastructure powering millions of websites. You'll ship features used by developers around the world.",
    requirements: [
      'Solid experience with React and modern TypeScript.',
      'Comfort working across the stack, from UI to build tooling.',
      'Familiarity with Next.js or similar frameworks.',
      'Strong written communication for an async, remote team.',
    ],
    benefits: [
      'Fully remote with flexible working hours.',
      'Home office and equipment stipend.',
      'Unlimited PTO and a yearly learning budget.',
      'Equity as part of the compensation package.',
    ],
    matchBreakdown: [
      { label: 'Frontend Skills', value: 93 },
      { label: 'Tools & Tech', value: 90 },
      { label: 'Education Align', value: 84 },
    ],
    recommended: true,
  },
  {
    id: '3',
    company: 'Scale AI',
    location: 'San Francisco, CA',
    tagline: 'The data engine for AI.',
    title: 'AI Operations Associate',
    description:
      "Support the operations behind Scale's data annotation pipelines, working closely with ML engineers to improve data quality at scale.",
    tags: ['Python', 'LLMs', 'Data Annotation'],
    type: 'Full-time',
    fit: 87,
    deadline: 'October 28, 2026',
    overview:
      "Support the operations behind Scale's data annotation pipelines, working closely with ML engineers to improve data quality at scale.",
    requirements: [
      'Comfortable writing scripts in Python for data workflows.',
      'Interest in machine learning and large language models.',
      'Detail-oriented with strong analytical thinking.',
      'Able to work cross-functionally with engineering and labeling teams.',
    ],
    benefits: [
      'Direct exposure to frontier AI model development.',
      'Health, dental and vision coverage from day one.',
      'Regular team offsites and learning stipend.',
      'Clear path to full-time ML operations roles.',
    ],
    matchBreakdown: [
      { label: 'ML Skills', value: 85 },
      { label: 'Tools & Tech', value: 90 },
      { label: 'Education Align', value: 86 },
    ],
    recommended: true,
  },
    {
    id: '4',
    company: 'Linear',
    location: 'Remote',
    tagline: 'Project management built for modern software teams.',
    title: 'Software Engineer Intern',
    description:
      "Join a small, high-craft engineering team building the tools that product teams use every day. You'll ship real features from your first week.",
    tags: ['TypeScript', 'GraphQL', 'React'],
    type: 'Internship',
    fit: 84,
    deadline: 'November 10, 2026',
    overview:
      "Join a small, high-craft engineering team building the tools that product teams use every day. You'll ship real features from your first week.",
    requirements: [
      'Solid experience with TypeScript and a modern frontend framework.',
      'Interest in developer tools and product-focused engineering.',
      'Comfort working with GraphQL APIs.',
      'Clear written communication for a remote, async team.',
    ],
    benefits: [
      'Fully remote with flexible hours.',
      'Mentorship from senior engineers.',
      'Equipment and learning stipend.',
      'Strong chance of a return offer.',
    ],
    matchBreakdown: [
      { label: 'Engineering Skills', value: 86 },
      { label: 'Tools & Tech', value: 85 },
      { label: 'Education Align', value: 80 },
    ],
  },
]

export const JOB_TYPES = ['All Types', 'Full-time', 'Internship', 'Paid Internship', 'Unpaid Internship', 'Co-op']
export const FIELDS_OF_STUDY = ['Computer Science', 'Product Design', 'Data Science', 'Finance']

export const UPCOMING_DEADLINES: Deadline[] = [
  { id: '1', title: 'AI Software Engineering Intern', company: 'Apple', location: 'Cupertino, CA', type: 'Internship', due: 'Due in 2d', status: 'saved', urgent: true },
  { id: '2', title: 'Frontend Developer (Copilot Team)', company: 'GitHub', location: 'Remote', type: 'Full-time', due: 'Due in 3d', status: 'in progress', urgent: true },
  { id: '3', title: 'Core Systems Engineer Intern', company: 'Notion', location: 'San Francisco, CA', type: 'Internship', due: 'Due in 3d', status: 'saved', urgent: true },
]

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: '1', icon: 'file', title: 'Applied to Vercel', time: 'Yesterday', text: 'Core Frontend Dev internship application submitted.' },
  { id: '2', icon: 'sparkles', title: 'Match score updated for Apple', time: '2 days ago', text: "AI matched your profile skills with Apple's team requirements." },
  { id: '3', icon: 'bookmark', title: 'Saved Linear Role', time: '3 days ago', text: 'Bookmarked Software Engineer Intern opportunity.' },
]

import type { ProfileFormState } from '../types/student'

export const STUDENT_TITLE = 'Alex Mercer'
export const STUDENT_SUBTITLE = 'Computer Science Undergraduate at Stanford University (Class of 2026)'
export const STUDENT_TAGLINE =
  'Passionate about AI safety, frontend architecture, and designing software tools that enhance human productivity.'
export const LAST_SYNCED = 'Last synchronized with AI Engine 4 minutes ago'

export const DEFAULT_PROFILE: ProfileFormState = {
  university: '',
  degree: '',
  gpa: '',
  graduationDate: '',
  bio: '',
  interests: '',
  preferredLocations: '',
  opportunityTypes: '',
  technicalSkills: [],
  softSkills: [],
  cvFileName: null,
  portfolioMode: 'project',
  projectFileName: null,
  portfolioUrl: '',
}


export const STUDENT_NOTIFICATIONS: StudentNotificationItem[] = [
  {
    id: '1',
    category: 'application',
    icon: 'calendarEvent',
    iconStyle: 'bg-blue-100 text-blue-600',
    title: 'Interview scheduled',
    description: 'Apple scheduled your interview for AI Software Engineering Intern on Oct 10, 2026.',
    time: '1h ago',
    read: false,
  },
  {
    id: '2',
    category: 'application',
    icon: 'check',
    iconStyle: 'bg-emerald-100 text-emerald-600',
    title: 'Application shortlisted',
    description: 'GitHub shortlisted you for Frontend Developer (Copilot Team).',
    time: '5h ago',
    read: false,
    link: '/student/applications',
  },
  {
    id: '3',
    category: 'deadline',
    icon: 'clock',
    iconStyle: 'bg-amber-100 text-amber-600',
    title: 'Deadline in 2 days',
    description: '"AI Software Engineering Intern" at Apple closes soon.',
    time: '1d ago',
    read: false,
    link: '/student/applications',
  },
  {
    id: '4',
    category: 'deadline',
    icon: 'bookmark',
    iconStyle: 'bg-slate-100 text-slate-600',
    title: 'Saved role closing soon',
    description: 'Your saved "Frontend Engineer Core" at Vercel closes in 5 days.',
    time: '2d ago',
    read: true,
    link: '/student/saved',
  },
  {
    id: '5',
    category: 'system',
    icon: 'x',
    iconStyle: 'bg-red-100 text-red-600',
    title: 'Application update',
    description: 'Notion moved forward with other candidates for Core Systems Engineer Intern.',
    time: '4d ago',
    read: true,
    link: '/student/applications',
  },
]

export const REPORT_STATS: ReportStat[] = [
  { label: 'Avg. AI Match Score', value: '85%', color: 'text-brand' },
  { label: 'Response Rate', value: '58%', color: 'text-navy' },
  { label: 'Interview Rate', value: '25%', color: 'text-blue-500' },
  { label: 'Offer Rate', value: '8%', color: 'text-emerald-600' },
]

export const MONTHLY_APPLICATIONS: MonthlyApplications[] = [
  { month: 'Apr', count: 3 },
  { month: 'May', count: 5 },
  { month: 'Jun', count: 2 },
  { month: 'Jul', count: 6 },
  { month: 'Aug', count: 9 },
  { month: 'Sep', count: 5 },
]

export const STATUS_FUNNEL: StatusFunnelStep[] = [
  { label: 'Applied', count: 12, percentOfTotal: 100, color: '#0b1437' },
  { label: 'Reviewed', count: 10, percentOfTotal: 85, color: '#3b82f6' },
  { label: 'Interviewed', count: 3, percentOfTotal: 58, color: '#8b5cf6' },
  { label: 'Offered', count: 1, percentOfTotal: 35, color: '#16a34a' },
]

export const SKILL_MATCHES: SkillMatchTag[] = [
  { skill: 'React', matches: 8, highlighted: true },
  { skill: 'TypeScript', matches: 7 },
  { skill: 'Python', matches: 5 },
  { skill: 'Figma', matches: 4 },
]


export const STUDENT_ACCOUNT_EMAIL = 'alex.mercer@stanford.edu'

// TODO: replace this mock data with real API calls (services/studentService)
export const DEFAULT_STUDENT_NOTIFICATION_PREFS: StudentNotificationPreference[] = [
  { id: 'status-updates', label: 'Application status updates', description: 'When a status changes on any application', enabled: true },
  { id: 'deadline-reminders', label: 'Deadline reminders', description: 'Alerts before saved or applied roles close', enabled: true },
  { id: 'new-matches', label: 'New match recommendations', description: 'When AI finds a strong new fit for you', enabled: false },
  { id: 'weekly-digest', label: 'Weekly digest email', description: 'A summary of your job search activity', enabled: false },
]

export const DEFAULT_STUDENT_VISIBILITY_PREFS: StudentVisibilityPreference[] = [
  { id: 'discoverable', label: 'Discoverable by organizations', description: 'Let recruiters find your profile in search', enabled: true },
  { id: 'show-gpa', label: 'Show GPA on profile', description: 'Visible to organizations you apply to', enabled: false },
]