import TagList from '../ui/TagList'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function SkillsInventoryCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Skills Inventory</h2>
      <p className="mt-1 text-xs text-slate-500">Categorized professional competencies.</p>

      <div className="mt-5 space-y-6">
        <TagList
          label="Technical Skills"
          items={profile.technicalSkills}
          addLabel="Add Tech Skill"
          onAdd={(v) => onChange('technicalSkills', [...profile.technicalSkills, v])}
          onRemove={(i) => onChange('technicalSkills', profile.technicalSkills.filter((_, idx) => idx !== i))}
        />
        <TagList
          label="Soft Skills"
          items={profile.softSkills}
          addLabel="Add Soft Skill"
          onAdd={(v) => onChange('softSkills', [...profile.softSkills, v])}
          onRemove={(i) => onChange('softSkills', profile.softSkills.filter((_, idx) => idx !== i))}
        />
      </div>
    </section>
  )
}