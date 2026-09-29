export default function MatchScoreBar({ score, tier }: { score: number; tier: string }) {
  const color = score >= 90 ? 'bg-amber-500' : score >= 80 ? 'bg-emerald-500' : 'bg-slate-400'
  const textColor = score >= 90 ? 'text-amber-600' : score >= 80 ? 'text-emerald-600' : 'text-slate-500'

  return (
    <div>
      <p className={`text-xs font-semibold ${textColor}`}>
        {score}% ({tier})
      </p>
      <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}