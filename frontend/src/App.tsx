import { useState } from 'react'

const opportunities = [
  { title: 'UX Design Intern', organization: 'Lumina Labs', type: 'Internship', location: 'Remote' },
  { title: 'Frontend Developer', organization: 'Northstar', type: 'Part-time', location: 'Hybrid' },
  { title: 'Marketing Fellow', organization: 'Goodwell', type: 'Fellowship', location: 'Remote' },
]

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div id="top" className="min-h-screen bg-amber-50 text-slate-900">
      <header className="border-b border-slate-200 bg-amber-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="#top" className="flex items-center gap-3 font-semibold" aria-label="Opportunity Hub home">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-amber-400">✦</span>
            <span className="leading-tight">Opportunity Hub</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main navigation">
            <button onClick={() => scrollTo('how-it-works')}>How it works</button>
            <button onClick={() => scrollTo('opportunities')}>Explore opportunities</button>
            <button onClick={() => scrollTo('for-organizations')}>For organizations</button>
            <button onClick={() => scrollTo('cta')} className="rounded-md bg-amber-400 px-4 py-2">
              Get started
            </button>
          </nav>
          <button className="p-2 md:hidden" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="text-xl">☰</span>
          </button>
        </div>
        {menuOpen && (
          <nav className="space-y-3 border-t border-slate-200 px-6 py-4 text-sm md:hidden" aria-label="Mobile navigation">
            <button className="block" onClick={() => scrollTo('how-it-works')}>How it works</button>
            <button className="block" onClick={() => scrollTo('opportunities')}>Explore opportunities</button>
            <button className="block" onClick={() => scrollTo('for-organizations')}>For organizations</button>
          </nav>
        )}
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-amber-700">Make your next move</p>
            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Find work that <span className="text-amber-600">moves you forward.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Opportunity Hub connects ambitious students and recent graduates with meaningful opportunities from organizations that believe in their potential.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={() => scrollTo('opportunities')} className="rounded-md bg-slate-900 px-5 py-3 font-semibold text-white">
                Explore opportunities <span className="ml-2">↗</span>
              </button>
              <button onClick={() => scrollTo('for-organizations')} className="rounded-md border border-slate-300 px-5 py-3 font-semibold">
                I’m an organization
              </button>
            </div>
          </div>
          <div className="relative rounded-3xl bg-emerald-100 p-8">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <p className="text-sm font-semibold text-slate-500">Your next opportunity</p>
              <h2 className="mt-4 text-2xl font-bold">Product Design Intern</h2>
              <p className="mt-2 text-slate-500">Lumina Labs · Remote</p>
              <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">New match</span>
                <span className="text-slate-500">Posted 2d ago</span>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Simple by design</p>
            <h2 className="mt-3 text-4xl font-bold">Your next chapter starts here.</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {['Create your profile', 'Discover your match', 'Take your next step'].map((title, index) => (
                <article key={title}>
                  <span className="text-3xl font-bold text-amber-500">0{index + 1}</span>
                  <h3 className="mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">A simple path from your goals to opportunities that fit them.</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="opportunities" className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Opportunities worth finding</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold">Something good is waiting for you.</h2>
            <button className="font-semibold underline underline-offset-4">View all opportunities ↗</button>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {opportunities.map((opportunity) => (
              <article key={opportunity.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{opportunity.type}</span>
                <h3 className="mt-8 text-xl font-bold">{opportunity.title}</h3>
                <p className="mt-2 text-slate-600">{opportunity.organization}</p>
                <p className="mt-6 text-sm text-slate-500">{opportunity.location} · Posted 2d ago</p>
              </article>
            ))}
          </div>
        </section>

        <section id="for-organizations" className="bg-emerald-100 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="max-w-2xl text-4xl font-bold">Great people are looking for you.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-700">Reach early-career talent who are ready to contribute, learn, and grow with your organization.</p>
          </div>
        </section>

        <section id="cta" className="bg-slate-900 px-6 py-20 text-center text-white">
          <h2 className="text-4xl font-bold">Ready to find your thing?</h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-300">Good work starts with a single step. Take yours today.</p>
          <button onClick={() => scrollTo('opportunities')} className="mt-8 rounded-md bg-amber-400 px-5 py-3 font-semibold text-slate-900">
            Get started — it’s free ↗
          </button>
        </section>
      </main>
    </div>
  )
}
