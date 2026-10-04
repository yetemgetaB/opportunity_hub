import Dropzone from '../ui/Dropzone'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function CurriculumVitaeCard({ profile, onChange }: Props) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <header className="mb-5">
        <h2 className="font-display text-xl font-bold text-slate-900">Curriculum Vitae</h2>
        <p className="mt-1 text-sm text-gray-500">Supported formats: PDF, DOCX (Max 10MB)</p>
      </header>
      <div>
        <Dropzone
          hint="Drag & drop your resume here"
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