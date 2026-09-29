export default function AssessmentScoreRing({ score }: { score: number }) {
  return (
    <div
      className="relative h-16 w-16 shrink-0 rounded-full"
      style={{ background: `conic-gradient(#f5a623 ${score * 3.6}deg, #e5e7eb 0deg)` }}
    >
      <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-white">
        <span className="text-sm font-bold text-navy">{score}%</span>
      </div>
    </div>
  )
}