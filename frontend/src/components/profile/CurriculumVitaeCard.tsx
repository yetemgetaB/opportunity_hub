import Dropzone from '../ui/Dropzone'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function CurriculumVitaeCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Curriculum Vitae</h2>
      <div className="mt-5">
        <Dropzone
          hint="Drag and drop your CV here"
          fileName={profile.cvFileName}
          onFile={(name) => onChange('cvFileName', name)}
          onClear={() => onChange('cvFileName', null)}
          accept={['pdf', 'docx']}
          maxSizeMB={10}
        />
      </div>
    </section>
  )
}