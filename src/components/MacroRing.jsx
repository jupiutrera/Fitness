export default function MacroRing({ consumed, goal, label }) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  const remaining = Math.max(goal - consumed, 0)
  const over = consumed > goal

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
          {/* progress */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={over ? '#ef4444' : '#6366f1'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(consumed)}</span>
          <span className="text-xs text-gray-400">/ {Math.round(goal)} kcal</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className={`text-xs ${over ? 'text-red-400' : 'text-gray-500'}`}>
          {over ? `+${Math.round(consumed - goal)} de más` : `${Math.round(remaining)} restantes`}
        </p>
      </div>
    </div>
  )
}
