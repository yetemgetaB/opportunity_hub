import Button from '../ui/Button'
import Icon from '../ui/Icon'

export default function CreateOpportunityPrompt() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-10 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
        <Icon name="plus" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Post a new opportunity</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
        Create an internship, job, fellowship, or event. Opportunity Hub will match qualified applicants for you.
      </p>
      <Button to="/organization/opportunities/new" className="mx-auto mt-5 rounded-full px-7 font-bold">
        <span className="flex items-center justify-center gap-2">
          Create Opportunity <Icon name="arrowRight" className="h-4 w-4" />
        </span>
      </Button>
    </section>
  )
}