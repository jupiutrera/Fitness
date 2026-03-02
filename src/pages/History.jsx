import { useState } from 'react'
import { getDiary, computeTotals, dateLabel, getGoals } from '../utils/storage'

function pct(v, goal) {
  return goal > 0 ? Math.min(Math.round((v / goal) * 100), 100) : 0
}

function MiniBar({ value, goal, color }) {
  return (
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct(value, goal)}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function History() {
  const diary = getDiary()
  const goals = getGoals()

  const entries = Object.entries(diary)
    .sort(([a], [b]) => b.localeCompare(a))
    .filter(([, log]) => Object.values(log.meals ?? {}).flat().length > 0)

  const [expandedDate, setExpandedDate] = useState(null)

  const MEALS = [
    { key: 'desayuno', label: 'Desayuno', emoji: '☀️' },
    { key: 'almuerzo', label: 'Almuerzo', emoji: '🥗' },
    { key: 'cena', label: 'Cena', emoji: '🌙' },
    { key: 'snacks', label: 'Snacks', emoji: '🍎' },
  ]

  if (entries.length === 0) {
    return (
      <div className="min-h-screen pb-nav bg-gray-950 flex flex-col">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-white">Historial</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
          <span className="text-6xl">📅</span>
          <p className="text-gray-400">Aún no hay registros</p>
          <p className="text-gray-600 text-sm">Empieza a anotar lo que comes hoy y aparecerá aquí.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-nav bg-gray-950">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Historial</h1>
        <p className="text-sm text-gray-400 mt-1">{entries.length} día{entries.length !== 1 ? 's' : ''} registrado{entries.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3">
        {entries.map(([date, log]) => {
          const totals = computeTotals(log)
          const isExpanded = expandedDate === date
          const kcalPct = pct(totals.calories, goals.calories)
          const over = totals.calories > goals.calories

          return (
            <div key={date} className="bg-gray-900 rounded-2xl overflow-hidden">
              {/* Day header */}
              <button
                onClick={() => setExpandedDate(isExpanded ? null : date)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex flex-col items-center justify-center leading-none">
                    <span className="text-xs text-gray-400">
                      {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-white leading-tight">
                      {new Date(date + 'T12:00:00').getDate()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">{dateLabel(date)}</p>
                    <p className={`text-xs ${over ? 'text-red-400' : 'text-gray-400'}`}>
                      {Math.round(totals.calories)} kcal
                      <span className="text-gray-600"> · {kcalPct}% del obj.</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 min-w-[5rem]">
                  <div className="h-1.5 w-20 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${kcalPct}%`,
                        backgroundColor: over ? '#ef4444' : '#6366f1',
                      }}
                    />
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-800 px-4 pt-3 pb-4 space-y-4">
                  {/* Macro summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-14">Proteína</span>
                      <MiniBar value={totals.protein} goal={goals.protein} color="#818cf8" />
                      <span className="text-xs text-gray-400 w-16 text-right">{Math.round(totals.protein * 10) / 10}g</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-14">Carbos</span>
                      <MiniBar value={totals.carbs} goal={goals.carbs} color="#34d399" />
                      <span className="text-xs text-gray-400 w-16 text-right">{Math.round(totals.carbs * 10) / 10}g</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-14">Grasas</span>
                      <MiniBar value={totals.fat} goal={goals.fat} color="#fb923c" />
                      <span className="text-xs text-gray-400 w-16 text-right">{Math.round(totals.fat * 10) / 10}g</span>
                    </div>
                  </div>

                  {/* Meals breakdown */}
                  {MEALS.map(({ key, label, emoji }) => {
                    const items = log.meals?.[key] ?? []
                    if (items.length === 0) return null
                    const mealKcal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
                    return (
                      <div key={key}>
                        <p className="text-xs text-gray-400 font-medium mb-1.5">
                          {emoji} {label} · {Math.round(mealKcal)} kcal
                        </p>
                        <div className="space-y-1">
                          {items.map((food) => (
                            <div key={food.id} className="flex items-center justify-between">
                              <p className="text-xs text-gray-300 truncate flex-1">{food.name}</p>
                              <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {food.grams}g · {food.calories} kcal
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
