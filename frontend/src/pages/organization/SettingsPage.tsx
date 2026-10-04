import SecurityCard from '../../components/settings/SecurityCard'
import NotificationPreferencesCard from '../../components/settings/NotificationPreferencesCard'
import TeamMembersCard from '../../components/settings/TeamMembersCard'
import SessionCard from '../../components/settings/SessionCard'
import DangerZoneCard from '../../components/settings/DangerZoneCard'

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <h2 className="font-display text-2xl font-bold text-black">Account Settings</h2>
      <p className="mt-1 text-sm text-slate-500">Manage your login, notifications, and team access.</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <SecurityCard />
          <NotificationPreferencesCard />
          <TeamMembersCard />
        </div>
        <div className="space-y-6">
          <SessionCard />
          <DangerZoneCard />
        </div>
      </div>
    </div>
  )
}