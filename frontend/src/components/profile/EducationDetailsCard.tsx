import TextField from '../ui/TextField'
import Textarea from '../ui/Textarea'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function EducationDetailsCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Education Details</h2>
      <p className="mt-1 text-xs text-slate-500">Your academic record.</p>

      <div className="mt-5 space-y-4">
        <TextField
          label="University"
          required
          placeholder="e.g. Stanford University"
          value={profile.university}
          onChange={(e) => onChange('university', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Degree"
            required
            placeholder="e.g. B.S. in Computer Science"
            value={profile.degree}
            onChange={(e) => onChange('degree', e.target.value)}
          />
          <TextField
            label="GPA"
            required
            placeholder="e.g. 3.8 / 4.0"
            value={profile.gpa}
            onChange={(e) => onChange('gpa', e.target.value)}
          />
        </div>
        <TextField
          label="Graduation Year"
          required
          placeholder="e.g. June 2026"
          value={profile.graduationDate}
          onChange={(e) => onChange('graduationDate', e.target.value)}
        />
        <Textarea
          label="Bio"
          placeholder="A couple sentences about your interests and what you're looking for."
          maxLength={500}
          rows={3}
          value={profile.bio}
          onChange={(e) => onChange('bio', e.target.value)}
        />
      </div>
    </section>
  )
}