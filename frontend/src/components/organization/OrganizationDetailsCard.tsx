import TextField from '../ui/TextField'
import Textarea from '../ui/Textarea'
import type { OrganizationProfileFormState } from '../../types/organization'

type Props = {
  profile: OrganizationProfileFormState
  onChange: <K extends keyof OrganizationProfileFormState>(key: K, value: OrganizationProfileFormState[K]) => void
}

export default function OrganizationDetailsCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Organization Details</h2>
      <p className="mt-1 text-xs text-slate-500">Basic information shown to students.</p>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Organization Name"
            required
            placeholder="e.g. Stanford Tech Lab"
            value={profile.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          <TextField
            label="Industry"
            required
            placeholder="e.g. Artificial Intelligence"
            value={profile.industry}
            onChange={(e) => onChange('industry', e.target.value)}
          />
        </div>
        <TextField
          label="Website"
          placeholder="e.g. https://yourcompany.com"
          value={profile.website}
          onChange={(e) => onChange('website', e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Headquarters Location"
            placeholder="e.g. Stanford, CA"
            value={profile.headquarters}
            onChange={(e) => onChange('headquarters', e.target.value)}
          />
          <TextField
            label="Team Size"
            placeholder="e.g. 11-50 employees"
            value={profile.teamSize}
            onChange={(e) => onChange('teamSize', e.target.value)}
          />
        </div>
        <Textarea
          label="About the Organization"
          placeholder="Tell students what your organization does and what it's like to work there..."
          rows={3}
          value={profile.about}
          onChange={(e) => onChange('about', e.target.value)}
        />
      </div>
    </section>
  )
}