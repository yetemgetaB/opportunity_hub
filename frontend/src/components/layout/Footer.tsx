import { FOOTER_COLUMNS } from '../../utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-5">
        <div>
          <p className="font-bold text-white"><span className="text-brand">✦</span> Opportunity Hub</p>
          <p className="mt-3 text-sm">Connecting talent with opportunity.</p>
        </div>
        {FOOTER_COLUMNS.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">{c.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map((l) => <li key={l}><a href="#" className="hover:text-white">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs">© 2026 Opportunity Hub. All rights reserved.</p>
    </footer>
  )
}