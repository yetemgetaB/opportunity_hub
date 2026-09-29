import Button from '../ui/Button'

export default function FinalCta() {
  return (
    <section className="bg-navy px-6 py-20 text-center text-white">
      <h2 className="text-4xl font-bold">Your next opportunity is waiting</h2>
      <p className="mx-auto mt-4 max-w-lg text-slate-300">Create a free profile and start applying today.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button to="/register/student">Create student profile</Button>
        <Button to="/register/organization" variant="outline">Post an opportunity</Button>
      </div>
    </section>
  )
}