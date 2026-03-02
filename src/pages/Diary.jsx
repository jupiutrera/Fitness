import { useState, useCallback } from 'react'
import MacroBar from '../components/MacroBar'
import SearchModal from '../components/SearchModal'
import {
  todayStr, getDayLog, getDiary, addFoodToMeal, removeFoodFromMeal,
  computeTotals, getGoals, dateLabel,
} from '../utils/storage'

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', emoji: '☀️' },
  { key: 'almuerzo', label: 'Almuerzo', emoji: '🥗' },
  { key: 'cena', label: 'Cena', emoji: '🌙' },
  { key: 'snacks', label: 'Snacks', emoji: '🍎' },
]

function buildDateList() {
  const diary = getDiary()
  const today = todayStr()
  const daysInDiary = Object.keys(diary).filter((d) => d !== today).sort((a, b) => b.localeCompare(a))
  return [today, ...daysInDiary.slice(0, 30)]
}

export default function Diary() {
  const [dates] = useState(buildDateList)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [dayLog, setDayLog] = useState(() => getDayLog(todayStr()))
  const [goals] = useState(getGoals)
  const [modal, setModal] = useState(null)
  const [expanded, setExpanded] = useState({ desayuno: true, almuerzo: true, cena: true, snacks: true })

  const selectDate = useCallback((date) => {
    setSelectedDate(date)
    setDayLog(getDayLog(date))
  }, [])

  const refresh = useCallback(() => setDayLog(getDayLog(selectedDate)), [selectedDate])

  function handleAdd(meal, food) {
    addFoodToMeal(selectedDate, meal, food)
    refresh()
  }

  function handleRemove(meal, foodId) {
    removeFoodFromMeal(selectedDate, meal, foodId)
    refresh()
  }

  const totals = computeTotals(dayLog)

  return (
    <div className="min-h-screen pb-nav bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-white">Diario</h1>
      </div>

      {/* Date selector */}
      <div className="overflow-x-auto px-4 pb-3">
        <div className="flex gap-2 w-max">
          {dates.map((date) => {
            const isSelected = date === selectedDate
            const dayLog_ = getDiary()[date]
            const hasData = dayLog_ && Object.values(dayLog_.meals ?? {}).flat().length > 0
            return (
              <button
                key={date}
                onClick={() => selectDate(date)}
                className={`flex flex-col items-center min-w-[3.5rem] px-2 py-2 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="text-xs font-medium">
                  {date === todayStr() ? 'Hoy' : new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold leading-tight">
                  {new Date(date + 'T12:00:00').getDate()}
                </span>
                {hasData && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white/60' : 'bg-indigo-500'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day summary */}
      <div className="mx-4 mb-4 bg-gray-900 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-300">
            {dateLabel(selectedDate)}
          </p>
          <span className={`text-sm font-bold ${totals.calories > goals.calories ? 'text-red-400' : 'text-white'}`}>
            {Math.round(totals.calories)} / {goals.calories} kcal
          </span>
        </div>
        <div className="space-y-2">
          <MacroBar macro="protein" consumed={totals.protein} goal={goals.protein} />
          <MacroBar macro="carbs" consumed={totals.carbs} goal={goals.carbs} />
          <MacroBar macro="fat" consumed={totals.fat} goal={goals.fat} />
        </div>
      </div>

      {/* Meals */}
      <div className="px-4 space-y-3">
        {MEALS.map(({ key, label, emoji }) => {
          const items = dayLog.meals?.[key] ?? []
          const mealKcal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
          const isExpanded = expanded[key]

          return (
            <div key={key} className="bg-gray-900 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emoji}</span>
                  <div className="text-left">
                    <p className="font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">{items.length} alimento{items.length !== 1 ? 's' : ''} · {Math.round(mealKcal)} kcal</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-800">
                  {items.map((food) => (
                    <div key={food.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{food.name}</p>
                        <p className="text-xs text-gray-500">
                          {food.grams}g · {food.calories} kcal · P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(key, food.id)}
                        className="ml-2 text-gray-600 hover:text-red-400 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setModal(key)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
        <SearchModal
          meal={modal}
          onClose={() => setModal(null)}
          onAdd={(food) => handleAdd(modal, food)}
        />
      )}
    </div>
  )
}
