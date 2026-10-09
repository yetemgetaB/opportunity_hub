import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { VoxideClient, VoxideWidget } from '@voxide/react'
import { opportunityService } from '../services/opportunityService'
import { applicationService } from '../services/applicationService'
import { recommendationService } from '../services/recommendationService'
import { logoutAccount, readStoredSession } from '../services/authService'
import { useAuthContext } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSaved } from '../context/SavedContext'
import type { OpportunityType } from '../types/opportunity'

// Publishable key — safe to ship in the browser
const ai = new VoxideClient({
  publicKey: 'vox_pub_1cbe5a069413d60b377a1cf5a1f2299c800d61200b44b34d',
})

// Bridge references so capabilities can interact with live React router & theme
let navigateBridge: ((path: string) => void) | null = null
let themeToggleBridge: ((target?: 'light' | 'dark' | 'toggle') => void) | null = null
let savedToggleBridge: ((id: string) => void) | null = null

const APP_ROUTES = [
  { path: '/', description: 'Home and landing page with overview and recent opportunities' },
  { path: '/opportunities', description: 'Browse and search all public opportunities, internships, and jobs' },
  { path: '/login', description: 'Account sign in page' },
  { path: '/register/student', description: 'Student account registration page' },
  { path: '/register/organization', description: 'Organization / employer account registration page' },
  { path: '/student', description: 'Student dashboard overview and stats' },
  { path: '/student/opportunities', description: 'Student opportunity directory' },
  { path: '/student/applications', description: 'Student applications and status tracking' },
  { path: '/student/saved', description: 'Student saved and bookmarked opportunities' },
  { path: '/student/notifications', description: 'Student notifications and inbox' },
  { path: '/student/reports', description: 'Student application reports and analytics' },
  { path: '/student/profile', description: 'Student profile, resume, and skills management' },
  { path: '/student/settings', description: 'Student account and preference settings' },
  { path: '/organization', description: 'Organization dashboard and overview' },
  { path: '/organization/opportunities', description: 'Manage posted organization opportunities' },
  { path: '/organization/opportunities/new', description: 'Post and create a new opportunity' },
  { path: '/organization/applicants', description: 'Review and evaluate student applicants' },
  { path: '/organization/assessment', description: 'Applicant assessments and evaluations' },
  { path: '/organization/profile', description: 'Organization profile and company info' },
  { path: '/organization/notifications', description: 'Organization notifications' },
  { path: '/organization/settings', description: 'Organization settings' },
]

// Register navigation capability with app routes
ai.enableNavigation(
  {
    push: (route: string) => {
      if (navigateBridge) {
        navigateBridge(route)
      } else if (typeof window !== 'undefined') {
        window.location.href = route
      }
    },
  },
  APP_ROUTES,
)

// Register REAL capabilities for Opportunity Hub
ai.register({
  searchOpportunities: {
    description:
      'Search and filter campus opportunities, internships, jobs, research, scholarships, hackathons, and competitions.',
    params: {
      keyword: { type: 'string', required: false, description: 'Keywords, role title, or technology (e.g. React, Research, Design)' },
      type: {
        type: 'string',
        required: false,
        description: 'Opportunity category',
        enum: ['INTERNSHIP', 'JOB', 'SCHOLARSHIP', 'HACKATHON', 'COMPETITION', 'TRAINING', 'VOLUNTEER', 'FELLOWSHIP', 'OTHER'],
      },
      field: { type: 'string', required: false, description: 'Field of study or industry (e.g. Software, Healthcare, Business)' },
      location: { type: 'string', required: false, description: 'City or campus location' },
      isRemote: { type: 'boolean', required: false, description: 'True for remote or work-from-home positions' },
    },
    handler: async ({ keyword, type, field, location, isRemote }) => {
      try {
        const results = await opportunityService.listOpportunities({
          search: keyword,
          type: type as OpportunityType | undefined,
          field,
          location,
          remote: isRemote === true ? 'remote' : undefined,
        })

        return {
          status: 'success',
          count: results.length,
          opportunities: results.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.title,
            type: item.opportunityType,
            location: item.location ?? 'Flexible',
            isRemote: item.isRemote,
            skills: item.skills,
          })),
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to search opportunities at this time.',
        }
      }
    },
  },

  getOpportunityDetails: {
    description: 'Fetch detailed information, requirements, compensation, and qualifications for a specific opportunity by ID.',
    params: {
      opportunityId: { type: 'string', required: true, description: 'The unique ID of the opportunity' },
    },
    handler: async ({ opportunityId }) => {
      try {
        const opp = await opportunityService.getOpportunity(opportunityId)
        const orgName = typeof opp.organization === 'object' && opp.organization ? opp.organization.name : 'Organization'
        return {
          status: 'success',
          id: opp.id,
          title: opp.title,
          organization: orgName,
          type: opp.opportunityType,
          location: opp.location,
          isRemote: opp.isRemote,
          description: opp.description,
          compensation: opp.compensation,
          applicationDeadline: opp.applicationDeadline,
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to find opportunity details.',
        }
      }
    },
  },

  getRecommendations: {
    description: 'Retrieve personalized opportunity recommendations for the current student based on their skills and profile.',
    params: {
      keyword: { type: 'string', required: false, description: 'Optional keyword or focus area' },
      type: { type: 'string', required: false, description: 'Optional opportunity type filter' },
    },
    handler: async ({ keyword, type }) => {
      try {
        const list = await recommendationService.getRecommendations({
          search: keyword,
          type: type as OpportunityType | undefined,
        })
        return {
          status: 'success',
          count: list.length,
          recommendations: list.slice(0, 5).map((r) => {
            const org = typeof r.opportunity.organization === 'object' && r.opportunity.organization ? r.opportunity.organization.name : undefined
            return {
              id: r.opportunity.id,
              title: r.opportunity.title,
              organization: org,
              score: r.score,
              matchedSkills: r.matchedSkills,
              type: r.opportunity.opportunityType,
            }
          }),
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Recommendations require an active student session.',
        }
      }
    },
  },

  getMyApplications: {
    description: 'List the job, internship, or opportunity applications submitted by the logged-in student and their statuses.',
    params: {},
    handler: async () => {
      try {
        const apps = await applicationService.getMyApplications()
        return {
          status: 'success',
          count: apps.length,
          applications: apps.map((a) => {
            const org = typeof a.opportunity?.organization === 'object' && a.opportunity?.organization ? a.opportunity.organization.name : undefined
            return {
              id: a.id,
              opportunityId: a.opportunityId,
              title: a.opportunity?.title ?? 'Opportunity',
              organization: org,
              status: a.status,
              appliedAt: a.appliedAt,
            }
          }),
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to retrieve applications.',
        }
      }
    },
  },

  saveOpportunity: {
    description: 'Save or bookmark an opportunity for later review.',
    params: {
      opportunityId: { type: 'string', required: true, description: 'The ID of the opportunity to save' },
    },
    handler: async ({ opportunityId }) => {
      try {
        if (savedToggleBridge) {
          savedToggleBridge(opportunityId)
        } else {
          await applicationService.saveOpportunity(opportunityId)
        }
        return { status: 'success', message: 'Opportunity saved successfully.', opportunityId }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to save opportunity.',
        }
      }
    },
  },

  unsaveOpportunity: {
    description: 'Remove an opportunity from the saved/bookmarked list.',
    params: {
      opportunityId: { type: 'string', required: true, description: 'The ID of the opportunity to remove' },
    },
    handler: async ({ opportunityId }) => {
      try {
        if (savedToggleBridge) {
          savedToggleBridge(opportunityId)
        } else {
          await applicationService.unsaveOpportunity(opportunityId)
        }
        return { status: 'success', message: 'Opportunity removed from saved list.', opportunityId }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to remove saved opportunity.',
        }
      }
    },
  },

  applyToOpportunity: {
    description: 'Submit an application for a specific opportunity on behalf of the student.',
    params: {
      opportunityId: { type: 'string', required: true, description: 'The ID of the opportunity to apply to' },
    },
    dangerous: true,
    handler: async ({ opportunityId }) => {
      try {
        const result = await applicationService.apply(opportunityId)
        return {
          status: 'success',
          applicationId: result.id,
          appliedAt: result.appliedAt,
          message: 'Application successfully submitted!',
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to submit application.',
        }
      }
    },
  },

  toggleTheme: {
    description: 'Switch between light mode and dark mode or set a specific theme.',
    params: {
      mode: {
        type: 'string',
        required: false,
        enum: ['light', 'dark', 'toggle'],
        description: 'Desired theme mode',
      },
    },
    handler: async ({ mode }) => {
      if (themeToggleBridge) {
        themeToggleBridge(mode as 'light' | 'dark' | 'toggle' | undefined)
      } else if (typeof document !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark')
        const next = mode === 'dark' ? true : mode === 'light' ? false : !isDark
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('opportunity-hub-theme', next ? 'dark' : 'light')
      }
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      return { status: 'success', theme: current }
    },
  },

  logout: {
    description: 'Log out of the current user account and return to login screen.',
    params: {},
    dangerous: true,
    handler: async () => {
      logoutAccount()
      if (navigateBridge) {
        navigateBridge('/login')
      } else if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return { status: 'logged_out', message: 'You have been logged out.' }
    },
  },
})

// Bind live UI and session state for the agent every turn
ai.bindState(() => {
  const session = typeof window !== 'undefined' ? readStoredSession() : null
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return {
    currentPage: currentPath,
    theme: isDark ? 'dark' : 'light',
    isAuthenticated: Boolean(session),
    userEmail: session?.email ?? null,
  }
})

export function Assistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const { toggleSaved } = useSaved()

  // Connect navigation bridge
  useEffect(() => {
    navigateBridge = navigate
    return () => {
      navigateBridge = null
    }
  }, [navigate])

  // Keep Voxide informed of active route changes
  useEffect(() => {
    ai.setActiveRoute(location.pathname)
  }, [location.pathname])

  // Connect theme bridge
  useEffect(() => {
    themeToggleBridge = (target) => {
      if (!target || target === 'toggle') {
        toggleTheme()
      } else if (target !== theme) {
        toggleTheme()
      }
    }
    return () => {
      themeToggleBridge = null
    }
  }, [theme, toggleTheme])

  // Connect saved toggle bridge
  useEffect(() => {
    savedToggleBridge = (id: string) => {
      toggleSaved(id)
    }
    return () => {
      savedToggleBridge = null
    }
  }, [toggleSaved])

  // Sync authenticated user identity with Voxide
  useEffect(() => {
    if (user) {
      ai.setUser({
        userId: user.id,
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        role: user.role,
      })
    } else {
      ai.setUser(null)
    }
  }, [user])

  // Pass nothing but the client. Every other prop outranks the dashboard, so
  // hardcoding one makes the matching Appearance control silently do nothing.
  return <VoxideWidget client={ai} />
}
