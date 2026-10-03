import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import ProfileHeaderCard from '../../components/profile/ProfileHeaderCard'
import EducationDetailsCard from '../../components/profile/EducationDetailsCard'
import CareerGoalsCard from '../../components/profile/CareerGoalsCard'
import SkillsInventoryCard from '../../components/profile/SkillsInventoryCard'
import CurriculumVitaeCard from '../../components/profile/CurriculumVitaeCard'
import ProjectsPortfolioCard from '../../components/profile/ProjectsPortfolioCard'
import type { ProfileFormState } from '../../types/student'
import { DEFAULT_PROFILE, LAST_SYNCED } from '../../utils/studentData'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileFormState>(DEFAULT_PROFILE)

  function update<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    // TODO: send `profile` to studentService.updateProfile(...)
    console.log('Saving profile', profile)
  }

  return (
    <div>
      <ProfileHeaderCard />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <EducationDetailsCard profile={profile} onChange={update} />
          <CareerGoalsCard profile={profile} onChange={update} />
        </div>
        <div className="space-y-6">
          <SkillsInventoryCard profile={profile} onChange={update} />
          <CurriculumVitaeCard profile={profile} onChange={update} />
          <ProjectsPortfolioCard profile={profile} onChange={update} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Icon name="clock" className="h-4 w-4" />
          {LAST_SYNCED}
        </p>
        <Button onClick={handleSave}>Save Profile Settings</Button>
      </div>
    </div>
  )
}