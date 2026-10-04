import StudentSecurityCard from '../../components/settings/StudentSecurityCard'
import StudentNotificationPreferencesCard from '../../components/settings/StudentNotificationPreferencesCard'
import ProfileVisibilityCard from '../../components/settings/ProfileVisibilityCard'
import StudentSessionCard from '../../components/settings/StudentSessionCard'
import StudentDangerZoneCard from '../../components/settings/StudentDangerZoneCard'

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <h2 className="font-display text-2xl font-bold text-black">Account Settings</h2>
      <p className="mt-1 text-sm text-slate-500">Manage your login, notifications, and visibility.</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <StudentSecurityCard />
          <StudentNotificationPreferencesCard />
          <ProfileVisibilityCard />
        </div>
        <div className="space-y-6">
          <StudentSessionCard />
          <StudentDangerZoneCard />
        </div>
      </div>
    </div>
  )
}