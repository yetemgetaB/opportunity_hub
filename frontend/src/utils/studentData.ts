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
  { label: 'Applications', title: 'Application Tracker', to: '/student/applications', icon: 'folder' },
  { label: 'Saved', title: 'Saved', to: '/student/saved', icon: 'bookmark' },
  { label: 'Profile', title: 'Student Profile', to: '/student/profile', icon: 'user' },
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

export { DEMO_OPPORTUNITIES as OPPORTUNITIES } from '../mock/opportunities'

export const JOB_TYPES = ['All Types', 'Full-time', 'Part-time', 'Internship', 'Scholarship', 'Hackathon', 'Competition', 'Training', 'Volunteer', 'Fellowship']
export const FIELDS_OF_STUDY = ['Computer Science', 'Software Engineering', 'Product Design', 'Data Science', 'Information Technology', 'Business', 'Engineering', 'Statistics', 'Education', 'Communications']

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