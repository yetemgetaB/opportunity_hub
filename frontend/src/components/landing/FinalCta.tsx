import Button from '../ui/Button'

export default function FinalCta() {
  return (
    <section className="bg-navy px-5 py-20 text-center text-white sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto flex max-w-[680px] flex-col items-center gap-4">
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Your Next Opportunity Is Waiting</h2>
        <p className="text-base leading-6 text-gray-300">
          Sign up today and let our platform match your profile with internships, scholarships, and organizations.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <Button to="/register/student" className="px-6 py-3.5">Get Started Free</Button>
          <Button to="/register/organization" variant="outline" className="px-6 py-3.5">Talk to Academic Relations</Button>
        </div>
      </div>
    </section>
  )
}
