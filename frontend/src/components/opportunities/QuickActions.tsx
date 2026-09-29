import Button from '../ui/Button'
import Icon from '../ui/Icon'

export default function QuickActions() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Quick Actions</h2>
      <div className="mt-5 space-y-3">
        {/* TODO: point these at the real create-opportunity / assessment routes */}
        <Button to="/organization/opportunities/new" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <Icon name="plus" className="h-4 w-4" /> Create Opportunity
          </span>
        </Button>
        <Button to="/organization/assessment" variant="secondary" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <Icon name="play" className="h-3.5 w-3.5" /> Start Assessment Run
          </span>
        </Button>
      </div>
    </section>
  )
}