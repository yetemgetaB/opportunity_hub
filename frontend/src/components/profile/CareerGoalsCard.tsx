import TextField from '../ui/TextField'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function CareerGoalsCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <header className="mb-5">
        <h2 className="font-display text-xl font-bold text-slate-900">Career Goals</h2>
        <p className="mt-1 text-sm text-gray-500">Define the placements that interest you</p>
      </header>

      <div className="space-y-4">
        <TextField
          label="Interests & Industries"
          required
          placeholder="e.g. AI, SaaS, Product Design"
          value={profile.interests}
          onChange={(e) => onChange('interests', e.target.value)}
          className="px-3 py-3"
        />
        <TextField
          label="Preferred Locations"
          required
          placeholder="e.g. San Francisco, CA (Remote OK)"
          value={profile.preferredLocations}
          onChange={(e) => onChange('preferredLocations', e.target.value)}
          className="px-3 py-3"
        />
        <TextField
          label="Opportunity Types"
          placeholder="e.g. Frontend Intern, PM Associate"
          value={profile.opportunityTypes}
          onChange={(e) => onChange('opportunityTypes', e.target.value)}
          className="px-3 py-3"
        />
      </div>
    </section>
  )
}