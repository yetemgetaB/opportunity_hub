export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">Application and opportunity updates.</p>
      </header>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-slate-800">Notifications are not available yet</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The backend currently has no notification endpoints, so updates cannot be loaded or marked as read.
        </p>
      </div>
    </div>
  )
}
