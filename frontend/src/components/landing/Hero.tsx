import Button from '../ui/Button'

const chips = ['Internships', 'Scholarships', 'Fellowships', 'Grants', 'Volunteering']
const floating = [
  { title: 'Product Designer', meta: 'Lumina Labs · Remote', cls: 'left-0 top-2 -rotate-6' },
  { title: 'Merit Scholarship', meta: 'Goodwell Foundation', cls: 'right-0 top-24 rotate-3' },
  { title: 'Data Fellowship', meta: 'Northstar · Hybrid', cls: 'bottom-0 left-10 rotate-2' },
]

export default function Hero() {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Find Opportunities That Move Your <span className="text-brand">Future Forward.</span>
          </h1>
          <p className="mt-5 max-w-lg text-slate-300">
            Connect with internships, scholarships, fellowships and grants from organizations that invest in you.
          </p>
          <div className="mt-8 flex max-w-lg gap-2 rounded-lg bg-white p-2">
            <input className="min-w-0 flex-1 px-3 text-slate-900 outline-none" placeholder="Search opportunities or organizations" aria-label="Search" />
            <Button>Search</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">{c}</span>
            ))}
          </div>
        </div>
        <div className="relative hidden h-80 md:block" aria-hidden="true">
          {floating.map((f) => (
            <div key={f.title} className={`absolute w-56 rounded-xl bg-white p-4 text-navy shadow-xl ${f.cls}`}>
              <p className="font-semibold">{f.title}</p>
              <p className="mt-1 text-xs text-slate-500">{f.meta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}