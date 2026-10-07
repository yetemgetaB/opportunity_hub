import Button from '../ui/Button'
import { ORG_PERKS, STUDENT_PERKS } from '../../utils/constants'

export default function AudienceSplit() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:gap-8">
        <article id="students" className="flex flex-col items-start gap-8 rounded-lg border border-neutral-200 bg-gray-50 p-7 sm:p-9 lg:p-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-3xl font-bold text-navy">For Students</h2>
            <p className="text-base leading-6 text-gray-500">
              Discover verified programs, track your progress, and get matched to jobs based on what you actually know, not just your resume.
            </p>
          </div>
          <ul className="flex w-full flex-col gap-4">
            {STUDENT_PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm font-medium leading-5 text-navy">
                <span className="mt-0.5 text-base font-bold leading-none text-brand" aria-hidden="true">✓</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <Button to="/register/student" variant="dark" className="!text-white">Create Student Profile</Button>
        </article>

        <article id="organizations" className="flex flex-col items-start gap-8 rounded-lg bg-navy p-7 text-white sm:p-9 lg:p-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-3xl font-bold">For Organizations</h2>
            <p className="text-base leading-6 text-gray-300">
              Connect with vetted, highly motivated student talent. Filter by verified skills, major, and course performance directly.
            </p>
          </div>
          <ul className="flex w-full flex-col gap-4">
            {ORG_PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm font-medium leading-5 text-white">
                <span className="mt-0.5 text-base font-bold leading-none text-brand" aria-hidden="true">✓</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <Button to="/register/organization">Register as Employer</Button>
        </article>
      </div>
    </section>
  )
}
