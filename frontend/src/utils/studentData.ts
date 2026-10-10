import type { IconName } from '../components/ui/Icon'

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

export const FIELDS_OF_STUDY = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science & Analytics',
  'Electrical & Computer Engineering',
  'Information Systems',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biomedical Engineering',
  'Product Design & UI/UX',
  'Business Administration',
  'Economics & Finance',
  'Marketing & Communications',
  'Statistics & Mathematics',
  'Education',
]
