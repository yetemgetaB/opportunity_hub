import EditableSkillList from './EditableSkillList'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function SkillsInventoryCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <header className="mb-5">
        <h2 className="font-display text-xl font-bold text-slate-900">Skills Inventory</h2>
        <p className="mt-1 text-sm text-gray-500">Categorized professional competencies</p>
      </header>

      <div className="space-y-4">
        <EditableSkillList
          label="Technical Skills"
          items={profile.technicalSkills}
          addLabel="Add Tech Skill"
          onAdd={(v) => onChange('technicalSkills', [...profile.technicalSkills, v])}
          onRemove={(i) => onChange('technicalSkills', profile.technicalSkills.filter((_, idx) => idx !== i))}
        />
        <EditableSkillList
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