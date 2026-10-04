import type { Opportunity } from '../types/opportunity'

export const NAV_LINKS = ['Opportunities', 'How it works', 'For students', 'For organizations']

export const CATEGORIES: [string, string][] = [
  ['💻', 'Technology'], ['🎨', 'Design'], ['📊', 'Business'], ['🩺', 'Health'],
  ['🎓', 'Education'], ['🔬', 'Science'], ['🌍', 'Community'],
]

export const STEPS = [
  { n: '01', title: 'Discover', text: 'Browse and filter opportunities tailored to your skills, interests, and academic goals with clean precision.' },
  { n: '02', title: 'Connect', text: 'Apply directly and let your profile reach organizations looking for your skills.' },
  { n: '03', title: 'Succeed', text: 'Track your applications, receive updates, and land the opportunity that advances your career.' },
]

export const FEATURED: Opportunity[] = [
  { id: '1', title: 'Software Engineering Intern', organization: 'Lumina Labs', type: 'Internship', location: 'Remote', deadline: 'Oct 30' },
  { id: '2', title: 'Data Science Fellowship', organization: 'Northstar Institute', type: 'Fellowship', location: 'Hybrid', deadline: 'Nov 12' },
  { id: '3', title: 'Community Impact Grant', organization: 'Goodwell Foundation', type: 'Grant', location: 'On-site', deadline: 'Nov 20' },
  { id: '4', title: 'National Scholarship 2026', organization: 'Merit Trust', type: 'Scholarship', location: 'Nationwide', deadline: 'Dec 5' },
]

export const STUDENT_PERKS = [
  'Smart opportunity matching based on your profile',
  'One unified profile for your applications',
  'Real-time updates on your application status',
  'Connect directly with program directors',
]

export const ORG_PERKS = [
  'Direct access to verified student talent',
  'Smart candidate filtering and matching',
  'Post internships and fellowship positions',
  'Insights on applicants and engagement',
]

export const STATS: [string, string][] = [
  ['50,000+', 'Verified Students'], ['2,500+', 'Partner Organizations'], ['10,000+', 'Opportunities Listed'], ['95%', 'Match Satisfaction'],
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