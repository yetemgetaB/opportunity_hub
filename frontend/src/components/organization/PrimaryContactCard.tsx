import TextField from '../ui/TextField'
import type { OrganizationProfileFormState } from '../../types/organization'

type Props = {
  profile: OrganizationProfileFormState
  onChange: <K extends keyof OrganizationProfileFormState>(key: K, value: OrganizationProfileFormState[K]) => void
}

export default function PrimaryContactCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Primary Contact</h2>
      <p className="mt-1 text-xs text-slate-500">Who students and admins can reach.</p>

      <div className="mt-5 space-y-4">
        <TextField
          label="Contact Name"
          placeholder="e.g. Jordan Lee"
          value={profile.contactName}
          onChange={(e) => onChange('contactName', e.target.value)}
        />
        <TextField
          label="Role / Title"
          placeholder="e.g. Head of University Recruiting"
          value={profile.contactRole}
          onChange={(e) => onChange('contactRole', e.target.value)}
        />
        <TextField
          label="Contact Email"
          type="email"
          placeholder="e.g. hiring@stanfordtechlab.com"
          value={profile.contactEmail}
          onChange={(e) => onChange('contactEmail', e.target.value)}
        />
        <TextField
          label="Phone Number"
          type="tel"
          placeholder="e.g. (555) 123-4567"
          value={profile.contactPhone}
          onChange={(e) => onChange('contactPhone', e.target.value)}
        />
      </div>
    </section>
  )
}