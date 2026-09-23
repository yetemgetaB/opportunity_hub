import { useState } from 'react'
import './index.css'

const opportunities = [
  { title: 'UX Design Intern', org: 'Lumina Labs', type: 'Internship', location: 'Remote', color: 'bg-amber-300' },
  { title: 'Frontend Developer', org: 'Northstar', type: 'Part-time', location: 'Hybrid', color: 'bg-sky-300' },
  { title: 'Marketing Fellow', org: 'Goodwell', type: 'Fellowship', location: 'Remote', color: 'bg-yellow-300' },
]

const testimonials = [
  ['Opportunity Hub helped me find an internship that actually matched what I care about. The whole process felt made for students.', 'Maya R.', 'Computer Science student'],
  ['We met incredible early-career talent in days, not months. It is now the first place we share every new role.', 'Jordan Lee', 'People lead at Northstar'],
]

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" aria-label="Opportunity Hub home" className={`${compact ? 'text-white' : 'text-slate-900'} flex items-center gap-3 font-semibold`}>
      <span className="inline-grid place-items-center w-7 h-7 rounded-md bg-amber-400 text-slate-900">✦</span>
      <span className="leading-tight text-sm">Opportunity<br className="hidden sm:inline" />Hub</span>
    </a>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('For students')
  const [testimonial, setTestimonial] = useState(0)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900">
      <header className="bg-amber-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium">How it works</button>
            <button onClick={() => scrollTo('opportunities')} className="text-sm font-medium">Explore opportunities</button>
            <button onClick={() => scrollTo('for-organizations')} className="text-sm font-medium">For organizations</button>
            <div className="h-6 w-px bg-slate-200" />
            <button onClick={() => scrollTo('cta')} className="text-sm">Log in</button>
            <button onClick={() => scrollTo('cta')} className="ml-2 inline-flex items-center bg-amber-400 text-slate-900 px-4 py-2 rounded-md text-sm font-semibold shadow-sm">Get started <span className="ml-3">↗</span></button>
          </div>
          <button className="md:hidden p-2" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-amber-50 border-t border-slate-200">
            <div className="px-6 py-4 space-y-3">
              <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left">How it works</button>
              <button onClick={() => scrollTo('opportunities')} className="block w-full text-left">Explore opportunities</button>
              <button onClick={() => scrollTo('for-organizations')} className="block w-full text-left">For organizations</button>
              <div className="border-t pt-3">
                <button onClick={() => scrollTo('cta')} className="block w-full text-left">Log in</button>
                <button onClick={() => scrollTo('cta')} className="mt-2 w-full text-left bg-amber-400 text-slate-900 px-4 py-2 rounded-md">Get started</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center py-16">
          <div>
            <p className="text-amber-600 text-xs font-medium uppercase tracking-widest">Your next opportunity starts here</p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">Find work that <span className="font-serif italic">moves</span> you forward.</h1>
            <p className="mt-4 text-slate-600 max-w-xl">Opportunity Hub connects ambitious students and recent graduates with meaningful opportunities from organizations that believe in their potential.</p>
            <div className="mt-6 flex items-center gap-4">
              <button onClick={() => scrollTo('opportunities')} className="inline-flex items-center bg-amber-400 text-slate-900 px-5 py-3 rounded-md font-semibold">Explore opportunities <span className="ml-3">↗</span></button>
              <button onClick={() => scrollTo('how-it-works')} className="text-sm font-semibold text-slate-700">See how it works <span className="ml-2">↓</span></button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-600">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center text-xs">J</div>
                <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center text-xs">M</div>
                <div className="w-8 h-8 bg-sky-200 rounded-full flex items-center justify-center text-xs">R</div>
                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-xs">A</div>
              </div>
              <div>Join <span className="font-semibold">12,000+</span> students building what’s next.</div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl transform rotate-1">
              <div className="h-8 flex items-center justify-between px-4 text-xs text-slate-400 border-b">● ● ● <span className="font-medium">opportunity hub</span> ⌁</div>
              <div className="p-4 grid grid-cols-[48px_1fr] gap-4">
                <aside className="bg-slate-800 text-white rounded p-2 flex flex-col items-center gap-3">
                  <div className="text-amber-400">✦</div>
                  <div className="h-2 w-3 bg-slate-600 rounded" />
                  <div className="h-2 w-3 bg-slate-600 rounded" />
                </aside>
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <small className="text-xs text-slate-400">Tuesday, October 15</small>
                      <h3 className="text-lg font-semibold mt-1">Good morning, Maya <span className="text-amber-400">✦</span></h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">M</div>
                  </div>
                  <div className="mt-3 bg-slate-900 text-white rounded-md p-3 flex justify-between items-center">
                    <div>
                      <small className="text-amber-300 text-xs">CURATED FOR YOU</small>
                      <div className="font-semibold">Opportunities that fit your future.</div>
                    </div>
                    <button className="bg-amber-400 text-slate-900 px-3 py-2 rounded">View →</button>
                  </div>

                  <div className="mt-4 text-xs text-slate-500 flex justify-between items-center">YOUR TOP MATCHES <span className="text-amber-400">See all →</span></div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {opportunities.map((it) => (
                      <div key={it.title} className="border rounded p-2 text-xs">
                        <div className={`${it.color} w-5 h-5 rounded flex items-center justify-center text-xs text-slate-900`}>{it.org[0]}</div>
                        <div className="font-medium text-xs mt-1">{it.title}</div>
                        <div className="text-xs text-slate-500">{it.org}</div>
                        <div className="text-xs text-slate-400">{it.location}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-6 bottom-8 bg-white rounded-md shadow p-3 text-xs">Profile strength <div className="font-semibold">92% <span className="text-green-500">↑12%</span></div></div>
            <div className="absolute -right-6 top-6 bg-white rounded-md shadow p-3 text-xs w-36">New match!<div className="text-slate-500 text-xs">Product Design Intern</div></div>
          </div>
        </section>

        <section className="bg-white border-t border-b py-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Trusted by students and teams at</p>
            <div className="mt-6 flex flex-wrap justify-center gap-8 text-slate-500 font-semibold">
              <span>northstar</span>
              <span>lumina</span>
              <span>goodwell</span>
              <span>orbit</span>
              <span>vertex</span>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 text-center">
          <p className="text-amber-600 text-xs font-medium uppercase tracking-widest">One place. More possibilities.</p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">Make your next move <span className="font-serif italic">meaningful</span>.</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Whether you’re searching for your first opportunity or your next great hire, we make finding the right fit feel simple.</p>

          <div className="mt-8 flex justify-center gap-6">
            {['For students', 'For organizations'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 ${activeTab === tab ? 'text-amber-500 border-b-2 border-amber-400' : 'text-slate-600'}`}>{tab}</button>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 border rounded">
              <div className="text-amber-500 font-semibold">01</div>
              <h3 className="mt-3 font-semibold">Discover your direction</h3>
              <p className="mt-2 text-slate-600">Tell us what you’re curious about and we’ll surface opportunities that align with your skills, goals, and values.</p>
              <button onClick={() => scrollTo('opportunities')} className="mt-4 text-amber-500 font-semibold">Explore opportunities →</button>
            </div>
            <div className="p-6 border rounded">
              <div className="text-amber-500 font-semibold">02</div>
              <h3 className="mt-3 font-semibold">Show up as yourself</h3>
              <p className="mt-2 text-slate-600">Build a profile that goes beyond a resume. Share what makes you, you—and let the right people find you.</p>
              <button onClick={() => scrollTo('cta')} className="mt-4 text-amber-500 font-semibold">Create your profile →</button>
            </div>
            <div className="p-6 border rounded">
              <div className="text-amber-500 font-semibold">03</div>
              <h3 className="mt-3 font-semibold">Make it happen</h3>
              <p className="mt-2 text-slate-600">Apply with confidence, connect directly, and take the next step toward work that feels like it matters.</p>
              <button onClick={() => scrollTo('cta')} className="mt-4 text-amber-500 font-semibold">Get started →</button>
            </div>
          </div>
        </section>

        <section id="for-organizations" className="bg-emerald-50 py-16">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="bg-white rounded-lg shadow p-6 rotate-[-3deg]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">M</div>
                  <div>
                    <div className="font-semibold">Maya Rodriguez</div>
                    <div className="text-xs text-slate-500">Computer Science · 3rd year</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs">Product design</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs">Research</span>
                </div>
                <div className="mt-4 border-t pt-3 flex justify-between text-center">
                  <div>
                    <div className="font-bold">12</div>
                    <div className="text-xs text-slate-500">Applications</div>
                  </div>
                  <div>
                    <div className="font-bold">08</div>
                    <div className="text-xs text-slate-500">Saved roles</div>
                  </div>
                  <div>
                    <div className="font-bold">92%</div>
                    <div className="text-xs text-slate-500">Profile strength</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 bottom-4 bg-slate-900 text-white text-sm rounded-md px-4 py-3">The whole you, not just your resume ✦</div>
            </div>
            <div>
              <p className="text-amber-600 text-xs font-medium uppercase tracking-widest">Built for real people</p>
              <h2 className="mt-4 text-3xl font-extrabold">Your story is <span className="font-serif italic">the advantage</span>.</h2>
              <p className="mt-3 text-slate-600">We believe the best opportunities come from seeing the full picture. Show employers what you bring to the table—and what you want to learn next.</p>
              <ul className="mt-4 space-y-2 text-slate-700 font-semibold">
                <li>✦ Highlight your unique strengths</li>
                <li>✦ Find teams where you’ll thrive</li>
                <li>✦ ✦ Apply to roles made for your stage</li>
              </ul>
              <button className="mt-6 text-amber-500 font-semibold">Build your profile ↗</button>
            </div>
          </div>
        </section>

        <section id="opportunities" className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-amber-600 text-xs font-medium uppercase tracking-widest">Opportunities worth finding</p>
              <h2 className="mt-3 text-3xl font-extrabold">Something good is <span className="font-serif italic">waiting for you</span>.</h2>
            </div>
            <button className="border rounded px-4 py-2">View all opportunities ↗</button>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {opportunities.map((op, idx) => (
              <article key={op.title} className="bg-white border rounded shadow-sm overflow-hidden hover:shadow-md transition">
                <div className={`h-36 flex items-center justify-center ${op.color}`}><span className="text-6xl text-white/80">{idx === 0 ? '✳' : idx === 1 ? '◒' : '✦'}</span></div>
                <div className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{op.title}</h3>
                      <p className="text-xs text-slate-500">{op.org}</p>
                    </div>
                    <div className="text-xl">♡</div>
                  </div>
                  <div className="mt-4 border-t pt-3 flex justify-between text-xs text-slate-400">
                    <span>⌖ {op.location}</span>
                    <span>◷ Posted 2d ago</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 py-16">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center gap-8">
            <div>
              <p className="text-amber-600 text-xs font-medium uppercase tracking-widest">The good word</p>
              <h2 className="mt-4 text-3xl font-extrabold">Don’t just take <span className="font-serif italic">our word for it</span>.</h2>
              <div className="mt-6 flex items-center gap-4">
                <button onClick={() => setTestimonial((testimonial + testimonials.length - 1) % testimonials.length)} className="w-8 h-8 rounded-full bg-white">←</button>
                <div className="text-sm text-slate-600">0{testimonial + 1} <span className="text-slate-400">/ 02</span></div>
                <button onClick={() => setTestimonial((testimonial + 1) % testimonials.length)} className="w-8 h-8 rounded-full bg-white">→</button>
              </div>
            </div>
            <blockquote className="bg-white rounded p-6 border-l-4 border-amber-400">
              <p className="font-serif text-lg">{testimonials[testimonial][0]}</p>
              <footer className="mt-4">
                <div className="font-semibold">{testimonials[testimonial][1]}</div>
                <div className="text-xs text-slate-500">{testimonials[testimonial][2]}</div>
              </footer>
            </blockquote>
          </div>
        </section>

        <section id="cta" className="bg-slate-900 text-white py-16">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-xs font-medium uppercase tracking-widest">Your next chapter is calling</p>
              <h2 className="mt-3 text-3xl font-extrabold">Ready to find <span className="font-serif italic">your thing</span>?</h2>
              <p className="mt-2 text-slate-300">Good work starts with a single step. Take yours today.</p>
            </div>
            <div>
              <button className="bg-amber-400 text-slate-900 px-5 py-3 rounded-md font-semibold" onClick={() => scrollTo('opportunities')}>Get started — it’s free ↗</button>
            </div>
          </div>
        </section>

        <footer className="bg-slate-900 text-slate-300 py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:justify-between gap-8">
            <div>
              <Logo compact />
              <div className="mt-4 text-sm text-slate-400">© 2025 Opportunity Hub. Made for what’s next.</div>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <div>
                <div className="font-semibold text-amber-400 text-xs uppercase tracking-wider mb-2">Explore</div>
                <a href="#opportunities" className="block text-sm">Opportunities</a>
                <a href="#how-it-works" className="block text-sm">How it works</a>
                <a href="#for-organizations" className="block text-sm">For organizations</a>
              </div>
              <div>
                <div className="font-semibold text-amber-400 text-xs uppercase tracking-wider mb-2">Connect</div>
                <a href="#cta" className="block text-sm">Instagram</a>
                <a href="#cta" className="block text-sm">LinkedIn</a>
                <a href="#cta" className="block text-sm">Contact us</a>
              </div>
              <div>
                <div className="font-semibold text-amber-400 text-xs uppercase tracking-wider mb-2">Stay in the loop</div>
                <p className="text-sm text-slate-400">Fresh opportunities, straight to your inbox.</p>
                <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex gap-2">
                  <input type="email" placeholder="Your email address" aria-label="Your email address" className="px-3 py-2 rounded bg-slate-800 text-white text-sm" />
                  <button className="px-3 py-2 bg-amber-400 rounded text-slate-900">→</button>
                </form>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}section className="section opportunities-section container" id="opportunities"><div className="section-top"><div><p className="eyebrow">Opportunities worth finding</p><h2>Something good is<br /><em>waiting for you.</em></h2></div><button className="outline-button">View all opportunities <span>↗</span></button></div><div className="opportunity-grid">{opportunities.map((item, index) => <article className="opportunity-card" key={item.title}><div className={`opportunity-art ${item.color}`}><span>{index === 0 ? '✳' : index === 1 ? '◒' : '✦'}</span><small>{item.type}</small></div><div className="opportunity-info"><div><h3>{item.title}</h3><p>{item.org}</p></div><span className="save">♡</span><div className="opportunity-meta"><span>⌖ {item.location}</span><span>◷ Posted 2d ago</span></div></div></article>)}</div></section>

        <section className="testimonial-section"><div className="container testimonial-grid"><div><p className="eyebrow">The good word</p><h2>Don’t just take<br /><em>our word for it.</em></h2><div className="quote-controls"><button onClick={() => setTestimonial((testimonial + testimonials.length - 1) % testimonials.length)}>←</button><span>0{testimonial + 1} <i>/ 02</i></span><button onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}>→</button></div></div><blockquote><span className="quote-mark">“</span><p>{testimonials[testimonial][0]}</p><footer><b>{testimonials[testimonial][1]}</b><small>{testimonials[testimonial][2]}</small></footer></blockquote></div></section>

        <section className="cta-section container" id="cta"><div><p className="eyebrow">Your next chapter is calling</p><h2>Ready to find<br /><em>your thing?</em></h2><p>Good work starts with a single step. Take yours today.</p><button className="button button--light" onClick={() => scrollTo('opportunities')}>Get started — it’s free <span>↗</span></button></div><div className="cta-spark">✦</div></section>
      </main>
      <footer className="footer"><div className="container footer-top"><Logo compact /><div className="footer-links"><div><b>Explore</b><a href="#opportunities">Opportunities</a><a href="#how-it-works">How it works</a><a href="#for-organizations">For organizations</a></div><div><b>Connect</b><a href="#cta">Instagram</a><a href="#cta">LinkedIn</a><a href="#cta">Contact us</a></div><div><b>Stay in the loop</b><p>Fresh opportunities, straight to your inbox.</p><form onSubmit={e => e.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Your email address" /><button aria-label="Subscribe">→</button></form></div></div></div><div className="container footer-bottom"><span>© 2025 Opportunity Hub. Made for what’s next.</span><span>Privacy &nbsp; · &nbsp; Terms</span></div></footer>
    </div>
  )
}

export default App
