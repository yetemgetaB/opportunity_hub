import Button from '../ui/Button'
import Icon from '../ui/Icon'

export default function QuickActions() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-slate-900">Quick Actions</h2>
      <div className="mt-4 space-y-3">
        {/* TODO: point these at the real create-opportunity / assessment routes */}
        <Button to="/organization/opportunities/new" className="h-12 w-full rounded-lg text-sm font-bold">
          <span className="flex items-center justify-center gap-2">
            <Icon name="plus" className="size-4" /> Create Opportunity
          </span>
        </Button>
        <Button to="/organization/assessment" variant="secondary" className="h-12 w-full rounded-lg text-sm font-semibold">
          <span className="flex items-center justify-center gap-2">
            <Icon name="play" className="size-3.5" /> Start Assessment Run
          </span>
        </Button>
      </div>
    </section>
  )
}