import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import ProfileHeaderCard from '../../components/organization/ProfileHeaderCard'
import OrganizationDetailsCard from '../../components/organization/OrganizationDetailsCard'
import FocusAreasCard from '../../components/organization/FocusAreasCard'
import PrimaryContactCard from '../../components/organization/PrimaryContactCard'
import SocialLinksCard from '../../components/organization/SocialLinksCard'
import type { OrganizationProfileFormState } from '../../types/organization'
import { DEFAULT_ORG_PROFILE, ORG_LAST_UPDATED } from '../../utils/organizationData'

export default function ProfilePage() {
  const [profile, setProfile] = useState<OrganizationProfileFormState>(DEFAULT_ORG_PROFILE)

  function update<K extends keyof OrganizationProfileFormState>(key: K, value: OrganizationProfileFormState[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    // TODO: send `profile` to organizationService.updateProfile(...)
    console.log('Saving organization profile', profile)
  }

  return (
    <div>
      <ProfileHeaderCard profile={profile} onChange={update} />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <OrganizationDetailsCard profile={profile} onChange={update} />
          <FocusAreasCard profile={profile} onChange={update} />
        </div>
        <div className="space-y-6">
          <PrimaryContactCard profile={profile} onChange={update} />
          <SocialLinksCard profile={profile} onChange={update} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Icon name="clock" className="h-4 w-4" />
          {ORG_LAST_UPDATED}
        </p>
        <Button onClick={handleSave}>Save Profile</Button>
      </div>
    </div>
  )
}