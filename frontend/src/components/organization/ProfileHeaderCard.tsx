import Icon from '../ui/Icon'
import Dropzone from '../ui/Dropzone'
import type { OrganizationProfileFormState } from '../../types/organization'

type Props = {
  profile: OrganizationProfileFormState
  onChange: <K extends keyof OrganizationProfileFormState>(key: K, value: OrganizationProfileFormState[K]) => void
}

export default function ProfileHeaderCard({ profile, onChange }: Props) {
  const initials = profile.name.trim()
    ? profile.name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '—'

  return (
    <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-navy text-lg font-bold text-white">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-navy">{profile.name || 'Your organization name'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {profile.about || 'Add a short description so students know what your organization does.'}
        </p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
          <Icon name="check" className="h-3 w-3" />
          Verified Organization
        </span>
      </div>
      <div className="w-40 shrink-0">
        <Dropzone
          compact
          hint="Update Logo"
          fileName={profile.logoFileName}
          onFile={(name) => onChange('logoFileName', name)}
          onClear={() => onChange('logoFileName', null)}
          accept={['png', 'jpg', 'jpeg']}
          maxSizeMB={5}
        />
      </div>
    </section>
  )
}