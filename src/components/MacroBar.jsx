const MACROS = {
  protein: { color: '#a78bfa', label: 'Proteína' },
  carbs:   { color: '#22d3ee', label: 'Carbos'   },
  fat:     { color: '#fb923c', label: 'Grasas'    },
}

export default function MacroBar({ macro, consumed, goal }) {
  const { color, label } = MACROS[macro] ?? { color: '#7c3aed', label: macro }
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0
  const over = consumed > goal

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-bg-card2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? '#ef4444' : color,
            boxShadow: over ? 'none' : `0 0 8px ${color}60`,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      <span className={`text-xs font-semibold w-16 text-right flex-shrink-0 ${over ? 'text-red-400' : 'text-gray-300'}`}>
        {Math.round(consumed * 10) / 10}<span className="text-gray-600">/{goal}g</span>
      </span>
    </div>
  )
}
