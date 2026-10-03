import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from '../pages/public/LandingPage'
import AuthLayout from '../layouts/AuthLayout'
import LoginPage from '../pages/auth/LoginPage'
import StudentRegisterPage from '../pages/auth/StudentRegisterPage'
import OrganizationRegisterPage from '../pages/auth/OrganizationRegisterPage'
import OrganizationLayout from '../layouts/OrganizationLayout'
import OrganizationDashboardPage from '../pages/organization/DashboardPage'
import OpportunitiesPage from '../pages/organization/OpportunitiesPage'
import CreateOpportunityPage from '../pages/organization/CreateOpportunityPage'
import ApplicantsPage from '../pages/organization/ApplicantsPage'
import ApplicantDetailsPage from '../pages/organization/ApplicantDetailsPage'
import AssessmentListPage from '../pages/organization/AssessmentListPage'
import AssessmentPage from '../pages/organization/AssessmentPage'
import OrganizationProfilePage from '../pages/organization/ProfilePage'
import OrganizationSettingsPage from '../pages/organization/SettingsPage'
import OrganizationNotificationsPage from '../pages/organization/NotificationsPage'
import StudentLayout from '../layouts/StudentLayout'
import StudentDashboardPage from '../pages/student/DashboardPage'
import StudentOpportunitiesPage from '../pages/student/OpportunitiesPage'
import OpportunityDetailPage from '../pages/student/OpportunityDetailPage'
import StudentProfilePage from '../pages/student/ProfilePage'
import StudentApplicationsPage from '../pages/student/ApplicationsPage'
import StudentSavedPage from '../pages/student/SavedPage'
import StudentNotificationsPage from '../pages/student/NotificationsPage'
import StudentReportsPage from '../pages/student/ReportsPage'
import StudentSettingsPage from '../pages/student/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/register/student" replace />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/organization" element={<OrganizationRegisterPage />} />
      </Route>

      <Route path="/organization" element={<OrganizationLayout />}>
        <Route index element={<OrganizationDashboardPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="opportunities/new" element={<CreateOpportunityPage />} />
        <Route path="applicants" element={<ApplicantsPage />} />
        <Route path="applicants/:id" element={<ApplicantDetailsPage />} />
        <Route path="applicants/:id/assessment" element={<AssessmentPage />} />
        <Route path="assessment" element={<AssessmentListPage />} />
        <Route path="profile" element={<OrganizationProfilePage />} />
        <Route path="settings" element={<OrganizationSettingsPage />} />
        <Route path="notifications" element={<OrganizationNotificationsPage />} />
        <Route path="*" element={<p className="text-sm text-slate-500">This page is coming soon.</p>} />
      </Route>

      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboardPage />} />
        <Route path="opportunities" element={<StudentOpportunitiesPage />} />
        <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
        <Route path="applications" element={<StudentApplicationsPage />} />
        <Route path="saved" element={<StudentSavedPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
        <Route path="reports" element={<StudentReportsPage />} />
        <Route path="settings" element={<StudentSettingsPage />} /> {/* NEW */}
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="*" element={<p className="text-sm text-slate-500">This page is coming soon.</p>} />
      </Route>
    </Routes>
  )
}