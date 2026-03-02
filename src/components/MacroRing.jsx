export default function MacroRing({ consumed, goal }) {
  const pct  = goal > 0 ? Math.min(consumed / goal, 1) : 0
  const over = consumed > goal
  const r    = 54
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  const remaining = Math.max(goal - consumed, 0)

  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke="#1a1a28" strokeWidth="10" />
        <circle cx="62" cy="62" r={r} fill="none"
          stroke={over ? '#ef4444' : '#7c3aed'} strokeWidth="14" opacity="0.12"
          strokeDasharray={`${dash} ${circ}`}
        />
        <circle cx="62" cy="62" r={r} fill="none"
          stroke={over ? '#ef4444' : 'url(#ringGrad)'}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white leading-none">{Math.round(consumed)}</span>
        <span className="text-xs text-gray-600 mt-0.5 font-medium">/ {Math.round(goal)} kcal</span>
        <span className={`text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${
          over ? 'bg-red-500/15 text-red-400' : 'bg-violet-500/10 text-violet-400'
        }`}>
          {over ? `+${Math.round(consumed - goal)}` : `-${Math.round(remaining)}`} kcal
        </span>
      </div>
    </div>
  )
}
