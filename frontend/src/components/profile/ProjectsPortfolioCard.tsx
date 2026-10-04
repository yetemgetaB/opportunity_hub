import Dropzone from '../ui/Dropzone'
import Icon from '../ui/Icon'
import type { ProfileFormState } from '../../types/student'

type Props = {
  profile: ProfileFormState
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
}

export default function ProjectsPortfolioCard({ profile, onChange }: Props) {
  const isProject = profile.portfolioMode === 'project'

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <header className="mb-5">
        <h2 className="font-display text-xl font-bold text-slate-900">Previous Projects / Portfolio</h2>
        <p className="mt-1 text-sm text-gray-500">Upload a project, or share a portfolio link.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange('portfolioMode', 'project')}
          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
            isProject ? 'border-brand bg-amber-50' : 'border-neutral-200'
          }`}
        >
          <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${isProject ? 'border-brand' : 'border-slate-300'}`}>
            {isProject && <span className="h-2 w-2 rounded-full bg-brand" />}
          </span>
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
              <Icon name="file" className="h-4 w-4" /> Previous Project
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange('portfolioMode', 'portfolio')}
          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
            !isProject ? 'border-brand bg-amber-50' : 'border-neutral-200'
          }`}
        >
          <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${!isProject ? 'border-brand' : 'border-slate-300'}`}>
            {!isProject && <span className="h-2 w-2 rounded-full bg-brand" />}
          </span>
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
              <Icon name="link" className="h-4 w-4" /> Portfolio
            </span>
          </span>
        </button>
      </div>

      <div className="mt-5">
        {isProject ? (
          <Dropzone
            compact
            hint="Upload your project file"
            fileName={profile.projectFileName}
            onFile={(name) => onChange('projectFileName', name)}
            onClear={() => onChange('projectFileName', null)}
            accept={['pdf', 'docx', 'zip']}
            maxSizeMB={10}
          />
        ) : (
          <input
            value={profile.portfolioUrl}
            onChange={(e) => onChange('portfolioUrl', e.target.value)}
            placeholder="https://yourportfolio.com"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm text-navy outline-none placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        )}
      </div>
    </section>
  )
}