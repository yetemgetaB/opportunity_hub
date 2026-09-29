import TextField from '../ui/TextField'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function CareerGoalsCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Career Goals</h2>
      <p className="mt-1 text-xs text-slate-500">What you're looking for.</p>

      <div className="mt-5 space-y-4">
        <TextField
          label="Interests & Industries"
          required
          placeholder="e.g. AI, SaaS, Product Design"
          value={profile.interests}
          onChange={(e) => onChange('interests', e.target.value)}
        />
        <TextField
          label="Preferred Locations"
          required
          placeholder="e.g. San Francisco, CA (Remote OK)"
          value={profile.preferredLocations}
          onChange={(e) => onChange('preferredLocations', e.target.value)}
        />
        <TextField
          label="Opportunity Types"
          placeholder="e.g. Frontend Intern, PM Associate"
          value={profile.opportunityTypes}
          onChange={(e) => onChange('opportunityTypes', e.target.value)}
        />
      </div>
    </section>
  )
}