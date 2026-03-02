import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import MacroRing from '../components/MacroRing'
import MacroBar from '../components/MacroBar'
import SearchModal from '../components/SearchModal'
import {
  todayStr, getDayLog, addFoodToMeal, removeFoodFromMeal, computeTotals, getGoals,
} from '../utils/storage'

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', emoji: '☀️' },
  { key: 'almuerzo', label: 'Almuerzo', emoji: '🥗' },
  { key: 'cena', label: 'Cena', emoji: '🌙' },
  { key: 'snacks', label: 'Snacks', emoji: '🍎' },
]

export default function Dashboard() {
  const today = todayStr()
  const [dayLog, setDayLog] = useState(() => getDayLog(today))
  const [goals] = useState(getGoals)
  const [modal, setModal] = useState(null) // meal key or null
  const [expanded, setExpanded] = useState({})

  const refresh = useCallback(() => setDayLog(getDayLog(today)), [today])

  const totals = computeTotals(dayLog)

  function handleAdd(meal, food) {
    addFoodToMeal(today, meal, food)
    refresh()
  }

  function handleRemove(meal, foodId) {
    removeFoodFromMeal(today, meal, foodId)
    refresh()
  }

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-screen pb-nav bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-gray-400 text-sm">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Resumen de hoy</h1>
        <p className="text-xs text-gray-500 mt-1">
          {now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Calorie ring */}
      <div className="flex flex-col items-center py-4 px-4">
        <MacroRing consumed={totals.calories} goal={goals.calories} label="Calorías" />
      </div>

      {/* Macro bars */}
      <div className="mx-4 bg-gray-900 rounded-2xl p-4 space-y-3">
        <MacroBar macro="protein" consumed={totals.protein} goal={goals.protein} />
        <MacroBar macro="carbs" consumed={totals.carbs} goal={goals.carbs} />
        <MacroBar macro="fat" consumed={totals.fat} goal={goals.fat} />
      </div>

      {/* Quick macro numbers */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Proteína', value: totals.protein, goal: goals.protein, color: 'text-indigo-400' },
          { label: 'Carbos', value: totals.carbs, goal: goals.carbs, color: 'text-emerald-400' },
          { label: 'Grasas', value: totals.fat, goal: goals.fat, color: 'text-orange-400' },
        ].map(({ label, value, goal, color }) => (
          <div key={label} className="bg-gray-900 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${color}`}>{Math.round(value * 10) / 10}g</p>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xs text-gray-600">/{goal}g</p>
          </div>
        ))}
      </div>

      {/* Meals */}
      <div className="mt-6 px-4 space-y-3">
        <h2 className="font-semibold text-gray-300 text-sm uppercase tracking-wide">Comidas</h2>
        {MEALS.map(({ key, label, emoji }) => {
          const items = dayLog.meals?.[key] ?? []
          const mealKcal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
          const isExpanded = expanded[key]

          return (
            <div key={key} className="bg-gray-900 rounded-2xl overflow-hidden">
              {/* Meal header */}
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

              {/* Food list */}
              {isExpanded && (
                <div className="border-t border-gray-800">
                  {items.map((food) => (
                    <div key={food.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.grams}g · {food.calories} kcal</p>
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

                  {/* Add food button */}
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

              {/* Collapsed add button */}
              {!isExpanded && (
                <div className="border-t border-gray-800">
                  <button
                    onClick={() => { setExpanded((e) => ({ ...e, [key]: true })); setModal(key) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
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

      {/* CTA if no goals set */}
      {goals.calories === 2000 && (
        <Link to="/objetivos" className="mx-4 mt-4 flex items-center gap-3 bg-indigo-950 border border-indigo-800 rounded-2xl p-4">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-sm font-medium text-indigo-300">Establece tus objetivos</p>
            <p className="text-xs text-indigo-500">Personaliza tus metas de macros y calorías</p>
          </div>
          <svg className="w-5 h-5 text-indigo-500 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      <div className="h-4" />

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
