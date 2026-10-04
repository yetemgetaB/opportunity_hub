import TextField from '../ui/TextField'
import Textarea from '../ui/Textarea'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function EducationDetailsCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <header className="mb-5">
        <h2 className="font-display text-xl font-bold text-slate-900">Education Details</h2>
        <p className="mt-1 text-sm text-gray-500">Your institutional academic records</p>
      </header>

      <div className="space-y-4">
        <TextField
          label="University"
          required
          placeholder="e.g. Stanford University"
          value={profile.university}
          onChange={(e) => onChange('university', e.target.value)}
          className="px-3 py-3"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <TextField
            label="Degree"
            required
            placeholder="e.g. B.S. in Computer Science"
            value={profile.degree}
            onChange={(e) => onChange('degree', e.target.value)}
            className="px-3 py-3"
          />
          <TextField
            label="GPA"
            required
            placeholder="e.g. 3.8 / 4.0"
            value={profile.gpa}
            onChange={(e) => onChange('gpa', e.target.value)}
            className="px-3 py-3"
          />
        </div>
        <TextField
          label="Graduation Year"
          required
          placeholder="e.g. June 2026"
          value={profile.graduationDate}
          onChange={(e) => onChange('graduationDate', e.target.value)}
          className="px-3 py-3"
        />
        <Textarea
          label="Bio"
          placeholder="A couple sentences about your interests and what you're looking for."
          maxLength={500}
          rows={3}
          value={profile.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          className="bg-white px-3 py-3"
        />
      </div>
    </section>
  )
}