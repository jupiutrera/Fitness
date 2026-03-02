import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import MacroRing from '../components/MacroRing'
import MacroBar from '../components/MacroBar'
import SearchModal from '../components/SearchModal'
import {
  todayStr, getDayLog, addFoodToMeal, removeFoodFromMeal,
  computeTotals, getGoals, getProfile, getStreak, saveMealCombo,
} from '../utils/storage'

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', emoji: '☀️',  color: '#fbbf24' },
  { key: 'almuerzo', label: 'Almuerzo', emoji: '🥗',  color: '#34d399' },
  { key: 'cena',     label: 'Cena',     emoji: '🌙',  color: '#818cf8' },
  { key: 'snacks',   label: 'Snacks',   emoji: '🍎',  color: '#fb923c' },
]

function SaveMealModal({ mealKey, meal, onSave, onClose }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 animate-fade-in">
      <div className="w-full bg-bg-card rounded-t-3xl p-5 pb-safe border-t border-bg-border animate-slide-up">
        <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-white mb-1">Guardar comida</h3>
        <p className="text-xs text-gray-500 mb-4">Guarda este combo para añadirlo rápido otro día</p>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Desayuno de semana" className="input-dark mb-4" autoFocus />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-bg-card2 border border-bg-border text-gray-300 font-medium tap">Cancelar</button>
          <button onClick={() => { onSave(name.trim() || mealKey + ' guardado', meal); onClose() }}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold tap">Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const today    = todayStr()
  const [dayLog, setDayLog] = useState(() => getDayLog(today))
  const [goals]   = useState(getGoals)
  const [profile] = useState(getProfile)
  const streak    = getStreak()
  const [modal, setModal]     = useState(null)
  const [expanded, setExpanded] = useState({})
  const [saveModal, setSaveModal] = useState(null)

  const refresh = useCallback(() => setDayLog(getDayLog(today)), [today])
  function handleAdd(meal, food)   { addFoodToMeal(today, meal, food); refresh() }
  function handleRemove(meal, id)  { removeFoodFromMeal(today, meal, id); refresh() }
  function handleSaveCombo(name, items) { saveMealCombo({ name, foods: items }) }

  const totals = computeTotals(dayLog)
  const now    = new Date()
  const hour   = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const macroKcal = {
    protein: Math.round(totals.protein * 4),
    carbs:   Math.round(totals.carbs * 4),
    fat:     Math.round(totals.fat * 9),
  }

  return (
    <div className="min-h-screen pb-nav bg-bg">
      <div className="px-5 pt-8 pb-2">
        <p className="text-gray-500 text-sm font-medium">{greeting}{profile.name ? ', ' + profile.name : ' 👋'}</p>
        <div className="flex items-end justify-between mt-0.5">
          <h1 className="text-2xl font-black text-white">Resumen de hoy</h1>
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-amber-400">{streak}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5 capitalize">
          {now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="mx-5 mt-4 card p-5 flex flex-col items-center">
        <MacroRing consumed={totals.calories} goal={goals.calories} />
        <div className="w-full mt-5 space-y-2.5">
          <MacroBar macro="protein" consumed={totals.protein} goal={goals.protein} />
          <MacroBar macro="carbs"   consumed={totals.carbs}   goal={goals.carbs}   />
          <MacroBar macro="fat"     consumed={totals.fat}     goal={goals.fat}      />
        </div>
        <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Proteína', kcal: macroKcal.protein, color: '#a78bfa' },
            { label: 'Carbos',   kcal: macroKcal.carbs,   color: '#22d3ee' },
            { label: 'Grasas',   kcal: macroKcal.fat,     color: '#fb923c' },
          ].map(({ label, kcal, color }) => (
            <div key={label}>
              <p className="text-sm font-bold" style={{ color }}>{kcal}</p>
              <p className="text-xs text-gray-600">{label} kcal</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 px-5 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Comidas</h2>
        {MEALS.map(({ key, label, emoji, color }) => {
          const items    = dayLog.meals?.[key] ?? []
          const mealKcal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
          const isOpen   = expanded[key]
          return (
            <div key={key} className="card overflow-hidden">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                className="w-full flex items-center gap-3 p-4 tap"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color + '18', border: '1px solid ' + color + '30' }}>
                  <span className="text-lg">{emoji}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-500">
                    {items.length > 0
                      ? items.length + ' alimento' + (items.length !== 1 ? 's' : '') + ' · ' + Math.round(mealKcal) + ' kcal'
                      : 'Sin registrar'}
                  </p>
                </div>
                {items.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSaveModal({ key, items }) }}
                    className="text-gray-600 hover:text-amber-400 transition-colors p-1.5 tap"
                    title="Guardar combo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                )}
                <svg className={'w-4 h-4 text-gray-600 transition-transform duration-200' + (isOpen ? ' rotate-180' : '')}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-bg-border">
                  {items.map((food) => (
                    <div key={food.id} className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border/60 last:border-0">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm text-white truncate font-medium">{food.name}</p>
                        <p className="text-xs text-gray-600">
                          {food.grams}g · <span className="text-gray-400">{food.calories} kcal</span>
                          {' · P:'}{food.protein}g C:{food.carbs}g G:{food.fat}g
                        </p>
                      </div>
                      <button onClick={() => handleRemove(key, food.id)}
                        className="p-1.5 text-gray-700 hover:text-red-400 transition-colors tap flex-shrink-0">
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

              {!isOpen && (
                <button
                  onClick={() => { setExpanded((e) => ({ ...e, [key]: true })); setModal(key) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-bg-border text-violet-400 text-sm font-semibold tap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir alimento
                </button>
              )}
            </div>
          )
        })}
      </div>

      {!profile.weightKg && (
        <Link to="/perfil" className="mx-5 mt-4 flex items-center gap-3 bg-violet-600/10 border border-violet-600/25 rounded-2xl p-4 tap">
          <span className="text-2xl">🎯</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-violet-300">Completa tu perfil</p>
            <p className="text-xs text-violet-500">Macros personalizados según tus datos</p>
          </div>
          <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      <div className="h-4" />

      {modal && (
        <SearchModal meal={modal} onClose={() => setModal(null)}
          onAdd={(food) => { handleAdd(modal, food); setModal(null) }} />
      )}
      {saveModal && (
        <SaveMealModal mealKey={saveModal.key} meal={saveModal.items}
          onSave={handleSaveCombo} onClose={() => setSaveModal(null)} />
      )}
    </div>
  )
}
