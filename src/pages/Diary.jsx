import { useState, useCallback } from 'react'
import MacroBar from '../components/MacroBar'
import SearchModal from '../components/SearchModal'
import {
  todayStr, getDayLog, getDiary, addFoodToMeal, removeFoodFromMeal,
  computeTotals, getGoals, dateLabel,
} from '../utils/storage'

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', time: '06-11h' },
  { key: 'almuerzo', label: 'Almuerzo', time: '12-15h' },
  { key: 'cena',     label: 'Cena',     time: '19-22h' },
  { key: 'snacks',   label: 'Snacks',   time: 'entre comidas' },
]

function buildDates() {
  const diary   = getDiary()
  const today   = todayStr()
  const past    = Object.keys(diary).filter((d) => d !== today).sort((a, b) => b.localeCompare(a)).slice(0, 30)
  return [today, ...past]
}

export default function Diary() {
  const [dates]         = useState(buildDates)
  const [selected, setSelected] = useState(todayStr)
  const [dayLog, setDayLog]     = useState(() => getDayLog(todayStr()))
  const [goals]                 = useState(getGoals)
  const [modal, setModal]       = useState(null)
  const [expanded, setExpanded] = useState({ desayuno: true, almuerzo: true, cena: true, snacks: true })

  const refresh = useCallback(() => setDayLog(getDayLog(selected)), [selected])

  function selectDate(d) { setSelected(d); setDayLog(getDayLog(d)) }
  function handleAdd(meal, food)  { addFoodToMeal(selected, meal, food); refresh() }
  function handleRemove(meal, id) { removeFoodFromMeal(selected, meal, id); refresh() }

  const totals = computeTotals(dayLog)

  return (
    <div className="min-h-screen pb-nav bg-bg">
      <div className="px-5 pt-8 pb-3">
        <h1 className="text-2xl font-black text-white">Diario</h1>
      </div>

      {/* Date strip */}
      <div className="overflow-x-auto px-5 pb-3">
        <div className="flex gap-2 w-max">
          {dates.map((date) => {
            const diary_ = getDiary()[date]
            const hasData = diary_ && Object.values(diary_.meals ?? {}).flat().length > 0
            const isToday = date === todayStr()
            const isSel   = date === selected
            const d       = new Date(date + 'T12:00:00')
            return (
              <button key={date} onClick={() => selectDate(date)}
                className={'flex flex-col items-center min-w-[3rem] px-2 py-2 rounded-2xl transition-all tap ' +
                  (isSel ? 'bg-violet-600 text-white' : 'bg-bg-card border border-bg-border text-gray-500')}>
                <span className="text-xs font-medium">{isToday ? 'Hoy' : d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span className="text-lg font-black leading-tight">{d.getDate()}</span>
                {hasData && <div className={'w-1.5 h-1.5 rounded-full mt-0.5 ' + (isSel ? 'bg-white/60' : 'bg-violet-500')} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day summary */}
      <div className="mx-5 mb-4 card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-300 capitalize">{dateLabel(selected)}</p>
          <span className={'text-sm font-black ' + (totals.calories > goals.calories ? 'text-red-400' : 'text-white')}>
            {Math.round(totals.calories)} <span className="text-gray-600 font-normal text-xs">/ {goals.calories} kcal</span>
          </span>
        </div>
        <div className="space-y-2">
          <MacroBar macro="protein" consumed={totals.protein} goal={goals.protein} />
          <MacroBar macro="carbs"   consumed={totals.carbs}   goal={goals.carbs}   />
          <MacroBar macro="fat"     consumed={totals.fat}     goal={goals.fat}      />
        </div>
      </div>

      {/* Meals */}
      <div className="px-5 space-y-3">
        {MEALS.map(({ key, label, time }) => {
          const items    = dayLog.meals?.[key] ?? []
          const mealKcal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
          const isOpen   = expanded[key]

          return (
            <div key={key} className="card overflow-hidden">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                className="w-full flex items-center justify-between p-4 tap"
              >
                <div className="text-left">
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-600">{time} · {Math.round(mealKcal)} kcal</p>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <span className="text-xs text-gray-600 bg-bg-card2 border border-bg-border px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  )}
                  <svg className={'w-4 h-4 text-gray-600 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-bg-border">
                  {items.map((food) => (
                    <div key={food.id} className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{food.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-600">{food.grams}g</span>
                          <span className="text-xs font-semibold text-amber-400/80">{food.calories} kcal</span>
                          <span className="text-xs text-violet-400/70">P:{food.protein}g</span>
                          <span className="text-xs text-cyan-400/70">C:{food.carbs}g</span>
                          <span className="text-xs text-orange-400/70">G:{food.fat}g</span>
                        </div>
                      </div>
                      <button onClick={() => handleRemove(key, food.id)}
                        className="ml-2 p-1.5 text-gray-700 hover:text-red-400 transition-colors tap flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setModal(key)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-violet-400 text-sm font-semibold tap">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir alimento
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <SearchModal meal={modal} onClose={() => setModal(null)}
          onAdd={(food) => { handleAdd(modal, food); setModal(null) }} />
      )}
    </div>
  )
}
