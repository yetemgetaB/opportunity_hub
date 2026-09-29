import TextField from '../ui/TextField'
import type { OrganizationProfileFormState } from '../../types/organization'

type Props = {
  profile: OrganizationProfileFormState
  onChange: <K extends keyof OrganizationProfileFormState>(key: K, value: OrganizationProfileFormState[K]) => void
}

export default function SocialLinksCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Social Links</h2>

      <div className="mt-5 space-y-4">
        <TextField
          label="LinkedIn"
          placeholder="e.g. linkedin.com/company/..."
          value={profile.linkedin}
          onChange={(e) => onChange('linkedin', e.target.value)}
        />
        <TextField
          label="X / Twitter"
          placeholder="e.g. x.com/yourcompany"
          value={profile.twitter}
          onChange={(e) => onChange('twitter', e.target.value)}
        />
      </div>
    </section>
  )
}