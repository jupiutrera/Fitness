const COLORS = {
  protein: { bar: '#818cf8', label: 'Proteína', unit: 'g' },
  carbs: { bar: '#34d399', label: 'Carbos', unit: 'g' },
  fat: { bar: '#fb923c', label: 'Grasas', unit: 'g' },
}

export default function MacroBar({ macro, consumed, goal }) {
  const { bar, label, unit } = COLORS[macro] ?? { bar: '#6366f1', label: macro, unit: '' }
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0
  const over = consumed > goal

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={over ? 'text-red-400' : 'text-gray-300'}>
          {Math.round(consumed * 10) / 10}{unit}
          <span className="text-gray-600"> / {goal}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : bar }}
        />
      </div>
    </div>
  )
}
