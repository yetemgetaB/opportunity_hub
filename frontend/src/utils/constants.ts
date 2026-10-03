import type { Opportunity } from '../types/opportunity'

export const NAV_LINKS = ['Opportunities', 'How it works', 'For students', 'For organizations']

export const CATEGORIES: [string, string][] = [
  ['💻', 'Technology'], ['🎨', 'Design'], ['📊', 'Business'], ['🩺', 'Health'],
  ['🎓', 'Education'], ['🔬', 'Science'], ['🌍', 'Community'],
]

export const STEPS = [
  { n: '01', title: 'Discover', text: 'Browse internships, scholarships, fellowships and grants that match your goals.' },
  { n: '02', title: 'Connect', text: 'Apply in minutes and hear back from organizations directly.' },
  { n: '03', title: 'Succeed', text: 'Complete assessments, track your applications and land your next step.' },
]

export const FEATURED: Opportunity[] = [
  { id: '1', title: 'Software Engineering Intern', organization: 'Lumina Labs', type: 'Internship', location: 'Remote', deadline: 'Oct 30' },
  { id: '2', title: 'Data Science Fellowship', organization: 'Northstar Institute', type: 'Fellowship', location: 'Hybrid', deadline: 'Nov 12' },
  { id: '3', title: 'Community Impact Grant', organization: 'Goodwell Foundation', type: 'Grant', location: 'On-site', deadline: 'Nov 20' },
  { id: '4', title: 'National Scholarship 2026', organization: 'Merit Trust', type: 'Scholarship', location: 'Nationwide', deadline: 'Dec 5' },
]

export const STUDENT_PERKS = [
  'Build one profile and apply everywhere',
  'Get matched to opportunities that fit',
  'Take assessments to stand out',
  'Track every application in one place',
]

export const ORG_PERKS = [
  'Post opportunities in minutes',
  'Review applicants side by side',
  'Run assessments and see results',
  'Reach early-career talent at scale',
]

export const STATS: [string, string][] = [
  ['50,000+', 'Students'], ['2,500+', 'Organizations'], ['10,000+', 'Opportunities'], ['95%', 'Satisfaction'],
]

export const TESTIMONIALS = [
  { quote: 'I found my internship in a week. The matches were actually relevant to me.', name: 'Amina K.', role: 'Computer science student' },
  { quote: 'The assessment let me show my skills before anyone looked at my CV.', name: 'Daniel T.', role: 'Design graduate' },
  { quote: 'Tracking every application in one place kept me calm during the whole search.', name: 'Sara M.', role: 'Scholarship recipient' },
]

export const FOOTER_COLUMNS = [
  { title: 'Product', links: ['Opportunities', 'How it works', 'Assessments'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact'] },
  { title: 'Resources', links: ['Help center', 'Guides', 'Blog'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
]