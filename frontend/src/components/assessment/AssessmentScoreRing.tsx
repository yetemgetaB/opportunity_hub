export default function AssessmentScoreRing({ score }: { score: number }) {
  const normalizedScore = Math.min(100, Math.max(0, score))

  return (
    <div
      role="img"
      aria-label={`AI match score: ${score}%`}
      className="relative h-16 w-16 shrink-0 rounded-full sm:h-[72px] sm:w-[72px]"
      style={{ background: `conic-gradient(from -90deg, #f3a311 ${normalizedScore * 3.6}deg, #e5e5e5 0deg)` }}
    >
      <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-white">
        <span aria-hidden="true" className="text-sm font-bold text-navy">{score}%</span>
      </div>
    </div>
  )
}