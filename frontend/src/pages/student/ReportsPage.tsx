export default function ReportsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">Application Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Review your application activity and outcomes.</p>
      </header>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-slate-800">Reports are not available yet</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The backend currently has no reporting endpoints. Dashboard totals are based only on your live opportunities and applications.
        </p>
      </div>
    </div>
  )
}
