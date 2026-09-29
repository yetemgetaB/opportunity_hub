import TagList from '../ui/TagList'
import type { OrganizationProfileFormState } from '../../types/organization'

type Props = {
  profile: OrganizationProfileFormState
  onChange: <K extends keyof OrganizationProfileFormState>(key: K, value: OrganizationProfileFormState[K]) => void
}

export default function FocusAreasCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Focus Areas</h2>
      <p className="mt-1 text-xs text-slate-500">Industries and fields you typically hire for.</p>
      <div className="mt-5">
        <TagList
          label="Focus Areas"
          items={profile.focusAreas}
          addLabel="Add Focus Area"
          onAdd={(v) => onChange('focusAreas', [...profile.focusAreas, v])}
          onRemove={(i) => onChange('focusAreas', profile.focusAreas.filter((_, idx) => idx !== i))}
        />
      </div>
    </section>
  )
}