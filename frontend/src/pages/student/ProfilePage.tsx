import { useState } from 'react'
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
    <div className="space-y-6">
      <ProfileHeaderCard />

      <div className="grid items-start gap-6 lg:grid-cols-2">
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

      <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-gray-500">{LAST_SYNCED}</p>
        <Button onClick={handleSave} className="w-full rounded-lg px-6 py-3 font-bold sm:w-auto">
          Save Profile Settings
        </Button>
      </div>
    </div>
  )
}