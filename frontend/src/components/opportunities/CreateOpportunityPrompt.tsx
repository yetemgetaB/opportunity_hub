import Button from '../ui/Button'
import Icon from '../ui/Icon'

export default function CreateOpportunityPrompt() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-600">
        <Icon name="plus" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-bold text-navy">Post a new opportunity</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        Create an internship, job, fellowship, or event. Opportunity Hub will match qualified applicants for you.
      </p>
      <Button to="/organization/opportunities/new" className="mx-auto mt-5">
        <span className="flex items-center justify-center gap-2">
          Create Opportunity <Icon name="arrowRight" className="h-4 w-4" />
        </span>
      </Button>
    </section>
  )
}