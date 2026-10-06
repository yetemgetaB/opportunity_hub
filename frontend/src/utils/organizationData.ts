import type { IconName } from '../components/ui/Icon'

export const ORG_NAV: { label: string; title: string; to: string; icon: IconName; end?: boolean }[] = [
  { label: 'Dashboard', title: 'Overview', to: '/organization', icon: 'dashboard', end: true },
  { label: 'My Opportunities', title: 'My Opportunities', to: '/organization/opportunities', icon: 'briefcase' },
  { label: 'Applicants', title: 'Applicant Hub', to: '/organization/applicants', icon: 'users' },
  { label: 'Profile', title: 'Profile', to: '/organization/profile', icon: 'user' },
  { label: 'AI Assessment', title: 'AI Assessment', to: '/organization/assessment', icon: 'sparkles' },
  { label: 'Notifications', title: 'Notifications', to: '/organization/notifications', icon: 'bell' },
  { label: 'Settings', title: 'Settings', to: '/organization/settings', icon: 'settings' },
]
