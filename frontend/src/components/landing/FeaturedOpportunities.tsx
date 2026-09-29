import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'
import OpportunityCard from '../opportunities/OpportunityCard'
import { FEATURED } from '../../utils/constants'

export default function FeaturedOpportunities() {
  return (
    <section id="opportunities" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Handpicked for you" title="Featured opportunities" subtitle="Fresh openings from organizations hiring and funding early-career talent." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((o) => <OpportunityCard key={o.id} o={o} />)}
        </div>
        <div className="mt-10 text-center">
          <Button variant="dark">View all opportunities</Button>
        </div>
      </div>
    </section>
  )
}
