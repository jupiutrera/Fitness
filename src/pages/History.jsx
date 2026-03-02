import { useState } from 'react'
import { getDiary, computeTotals, dateLabel, getGoals } from '../utils/storage'

const MEALS = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'almuerzo', label: 'Almuerzo' },
  { key: 'cena',     label: 'Cena'     },
  { key: 'snacks',   label: 'Snacks'   },
]

function Bar({ value, goal, color }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  return (
    <div className="flex-1 h-1.5 bg-bg-card2 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: pct + '%', backgroundColor: color }} />
    </div>
  )
}

export default function History() {
  const diary  = getDiary()
  const goals  = getGoals()
  const [open, setOpen] = useState(null)

  const entries = Object.entries(diary)
    .sort(([a], [b]) => b.localeCompare(a))
    .filter(([, log]) => Object.values(log.meals ?? {}).flat().length > 0)

  if (entries.length === 0) {
    return (
      <div className="min-h-screen pb-nav bg-bg flex flex-col">
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-black text-white">Historial</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-bg-card border border-bg-border flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-semibold">Sin registros aún</p>
          <p className="text-gray-600 text-sm">Empieza a registrar lo que comes y aparecerá aquí.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-nav bg-bg">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-black text-white">Historial</h1>
        <p className="text-sm text-gray-600 mt-0.5">{entries.length} día{entries.length !== 1 ? 's' : ''} registrado{entries.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-5 space-y-2">
        {entries.map(([date, log]) => {
          const totals  = computeTotals(log)
          const isOpen  = open === date
          const over    = totals.calories > goals.calories
          const kcalPct = goals.calories > 0 ? Math.min((totals.calories / goals.calories) * 100, 100) : 0
          const d       = new Date(date + 'T12:00:00')

          return (
            <div key={date} className="card overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : date)}
                className="w-full flex items-center gap-4 p-4 tap">
                {/* Date box */}
                <div className="w-11 flex flex-col items-center justify-center bg-bg-card2 border border-bg-border rounded-xl py-1.5 flex-shrink-0">
                  <span className="text-xs text-gray-600 leading-none capitalize">{d.toLocaleDateString('es-ES', { month: 'short' })}</span>
                  <span className="text-xl font-black text-white leading-tight">{d.getDate()}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm capitalize">{dateLabel(date)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-bg-card2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: kcalPct + '%', backgroundColor: over ? '#ef4444' : '#7c3aed' }} />
                    </div>
                    <span className={'text-xs font-semibold ' + (over ? 'text-red-400' : 'text-gray-400')}>
                      {Math.round(totals.calories)} kcal
                    </span>
                  </div>
                </div>

                <svg className={'w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ' + (isOpen ? 'rotate-180' : '')}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-bg-border px-4 pt-3 pb-4 space-y-4">
                  {/* Macro bars */}
                  <div className="space-y-1.5">
                    {[
                      { label: 'Proteína', val: totals.protein, goal: goals.protein, color: '#a78bfa' },
                      { label: 'Carbos',   val: totals.carbs,   goal: goals.carbs,   color: '#22d3ee' },
                      { label: 'Grasas',   val: totals.fat,     goal: goals.fat,     color: '#fb923c' },
                    ].map(({ label, val, goal, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-14">{label}</span>
                        <Bar value={val} goal={goal} color={color} />
                        <span className="text-xs text-gray-400 w-12 text-right">{Math.round(val * 10) / 10}g</span>
                      </div>
                    ))}
                  </div>

                  {/* Meal breakdown */}
                  {MEALS.map(({ key, label }) => {
                    const items = log.meals?.[key] ?? []
                    if (!items.length) return null
                    const kcal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
                    return (
                      <div key={key}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          {label} · {Math.round(kcal)} kcal
                        </p>
                        <div className="space-y-1">
                          {items.map((food) => (
                            <div key={food.id} className="flex items-center justify-between">
                              <p className="text-xs text-gray-300 truncate flex-1">{food.name}</p>
                              <p className="text-xs text-gray-600 ml-2 flex-shrink-0">{food.grams}g · {food.calories} kcal</p>
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
