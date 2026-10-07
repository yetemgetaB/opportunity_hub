const cls =
  'flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gray-50'

export default function SocialButtons({ verb }: { verb: 'Sign in' | 'Sign up' }) {
  return (
    <div className="space-y-2.5">
      <button type="button" className={cls}>
        <span className="font-bold text-lg text-blue-500">G</span>
        {verb} with Google
      </button>
      <button type="button" className={cls}>
        <span className="rounded-sm bg-sky-600 px-1 text-xs font-bold text-white">in</span>
        {verb} with LinkedIn
      </button>
    </div>
  )
}