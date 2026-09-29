import Button from '../ui/Button'
import { ORG_PERKS, STUDENT_PERKS } from '../../utils/constants'

const columns = [
  { title: 'For students', perks: STUDENT_PERKS, cta: 'Create student profile', to: '/register/student', dark: false },
  { title: 'For organizations', perks: ORG_PERKS, cta: 'Register organization', to: '/register/organization', dark: true },
]

export default function AudienceSplit() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        {columns.map((c) => (
          <div key={c.title} className={`rounded-2xl p-8 ${c.dark ? 'bg-navy text-white' : 'border border-slate-200 bg-white text-navy'}`}>
            <h3 className="text-2xl font-bold">{c.title}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {c.perks.map((p) => <li key={p}><span className="mr-2 text-brand">✓</span>{p}</li>)}
            </ul>
            <Button to={c.to} variant={c.dark ? 'primary' : 'dark'} className="mt-8">{c.cta}</Button>
          </div>
        ))}
      </div>
    </section>
  )
}