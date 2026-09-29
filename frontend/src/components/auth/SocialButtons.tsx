const cls =
  'flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white py-3 text-sm font-semibold text-navy hover:bg-slate-50'

export default function SocialButtons({ verb }: { verb: 'Sign in' | 'Sign up' }) {
  return (
    <div className="space-y-3">
      <button type="button" className={cls}>
        <span className="font-bold text-blue-600">G</span>
        {verb} with Google
      </button>
      <button type="button" className={cls}>
        <span className="rounded-sm bg-blue-700 px-1 text-xs font-bold text-white">in</span>
        {verb} with LinkedIn
      </button>
    </div>
  )
}