import { writeFileSync } from 'fs'
const base = 'C:/Users/utrerj/Documents/GitHub/Fitness/src'

writeFileSync(base + '/pages/Dashboard.jsx', `import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import MacroRing from '../components/MacroRing'
import MacroBar from '../components/MacroBar'
import SearchModal from '../components/SearchModal'
import {
  todayStr, getDayLog, addFoodToMeal, removeFoodFromMeal,
  computeTotals, getGoals, getProfile, getStreak, saveMealCombo,
  getMealSlots, saveMealSlots, DEFAULT_MEAL_SLOTS,
} from '../utils/storage'

// ── Meal editor modal ──────────────────────────────────────────────────────
function MealEditor({ slots, onSave, onClose }) {
  const [local, setLocal] = useState(slots.map((s) => ({ ...s })))

  function updateSlot(i, key, val) {
    setLocal((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  }
  function addSlot() {
    if (local.length >= 8) return
    setLocal((prev) => [...prev, { key: 'comida_' + Date.now(), label: 'Nueva comida', time: '' }])
  }
  function removeSlot(i) {
    if (local.length <= 1) return
    setLocal((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 animate-fade-in">
      <div className="w-full bg-bg-card border-t border-bg-border rounded-t-3xl p-5 pb-safe animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">Configurar comidas</h3>
          <button onClick={() => setLocal(DEFAULT_MEAL_SLOTS)}
            className="text-xs text-violet-400 font-medium tap">Restablecer</button>
        </div>
        <div className="space-y-2 mb-4">
          {local.map((slot, i) => (
            <div key={slot.key} className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  value={slot.label}
                  onChange={(e) => updateSlot(i, 'label', e.target.value)}
                  placeholder="Nombre"
                  className="input-dark"
                />
                <input
                  value={slot.time}
                  onChange={(e) => updateSlot(i, 'time', e.target.value)}
                  placeholder="Horario (opcional)"
                  className="input-dark"
                />
              </div>
              <button onClick={() => removeSlot(i)}
                className="w-8 h-8 rounded-lg text-gray-600 hover:text-red-400 flex items-center justify-center flex-shrink-0 tap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        {local.length < 8 && (
          <button onClick={addSlot}
            className="w-full py-2.5 rounded-xl border border-dashed border-bg-border text-gray-500 text-sm font-medium tap mb-4">
            + Añadir comida
          </button>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-bg-card2 border border-bg-border text-gray-300 font-medium tap">Cancelar</button>
          <button onClick={() => { onSave(local); onClose() }} className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold tap">Guardar</button>
        </div>
      </div>
    </div>
  )
}

// ── Save meal combo modal ──────────────────────────────────────────────────
function SaveMealModal({ mealKey, meal, onSave, onClose }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 animate-fade-in">
      <div className="w-full bg-bg-card border-t border-bg-border rounded-t-3xl p-5 pb-safe animate-slide-up">
        <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-4" />
        <p className="font-bold text-white mb-1">Guardar como combo</p>
        <p className="text-xs text-gray-600 mb-4">Lo encontrarás en el buscador para añadirlo de un toque</p>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Desayuno de semana" className="input-dark mb-4" autoFocus />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-bg-card2 border border-bg-border text-gray-300 font-medium tap">Cancelar</button>
          <button onClick={() => { onSave(name.trim() || mealKey, meal); onClose() }}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold tap">Guardar</button>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const today     = todayStr()
  const [dayLog, setDayLog]   = useState(() => getDayLog(today))
  const [goals]               = useState(getGoals)
  const [profile]             = useState(getProfile)
  const streak                = getStreak()
  const [slots, setSlots]     = useState(getMealSlots)
  const [modal, setModal]     = useState(null)
  const [expanded, setExpanded] = useState({})
  const [saveModal, setSaveModal] = useState(null)
  const [editSlots, setEditSlots] = useState(false)

  const refresh = useCallback(() => setDayLog(getDayLog(today)), [today])
  function handleAdd(meal, food)  { addFoodToMeal(today, meal, food); refresh() }
  function handleRemove(meal, id) { removeFoodFromMeal(today, meal, id); refresh() }
  function handleSaveCombo(name, items) { saveMealCombo({ name, foods: items }) }
  function handleSaveSlots(newSlots) { saveMealSlots(newSlots); setSlots(newSlots) }

  const totals = computeTotals(dayLog)
  const now    = new Date()
  const hour   = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-screen pb-nav bg-bg">
      {/* Header */}
      <div className="px-5 pt-8 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium uppercase tracking-widest">{greeting}</p>
            <h1 className="text-3xl font-black text-white mt-0.5 leading-none">
              {profile.name || 'Hoy'}
            </h1>
            <p className="text-xs text-gray-600 mt-1 capitalize">
              {now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1.5 border border-orange-500/30 bg-orange-500/8 rounded-2xl px-3 py-2">
              <span className="text-base">🔥</span>
              <div className="text-right">
                <p className="text-sm font-black text-orange-400 leading-none">{streak}</p>
                <p className="text-xs text-orange-600 leading-none">días</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calories + macros block */}
      <div className="mx-5 border border-bg-border rounded-3xl overflow-hidden">
        {/* Top: ring */}
        <div className="flex items-center justify-center py-6 px-5 border-b border-bg-border">
          <MacroRing consumed={totals.calories} goal={goals.calories} />
        </div>
        {/* Bottom: macro bars */}
        <div className="px-5 py-4 space-y-3">
          <MacroBar macro="protein" consumed={totals.protein} goal={goals.protein} />
          <MacroBar macro="carbs"   consumed={totals.carbs}   goal={goals.carbs}   />
          <MacroBar macro="fat"     consumed={totals.fat}     goal={goals.fat}      />
        </div>
        {/* Kcal breakdown */}
        <div className="grid grid-cols-3 divide-x divide-bg-border border-t border-bg-border">
          {[
            { label: 'Proteína', kcal: Math.round(totals.protein * 4), color: '#a78bfa' },
            { label: 'Carbos',   kcal: Math.round(totals.carbs * 4),   color: '#22d3ee' },
            { label: 'Grasas',   kcal: Math.round(totals.fat * 9),     color: '#fb923c' },
          ].map(({ label, kcal, color }) => (
            <div key={label} className="py-3 text-center">
              <p className="text-base font-black" style={{ color }}>{kcal}</p>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meals section */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Comidas</p>
          <button onClick={() => setEditSlots(true)}
            className="text-xs text-gray-600 hover:text-white transition-colors tap">
            Editar
          </button>
        </div>

        <div className="border border-bg-border rounded-3xl overflow-hidden divide-y divide-bg-border">
          {slots.map(({ key, label, time }) => {
            const items    = dayLog.meals?.[key] ?? []
            const mealKcal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
            const isOpen   = expanded[key]

            return (
              <div key={key}>
                <button
                  onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white text-sm">{label}</span>
                      {time && <span className="text-xs text-gray-600">{time}</span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {items.length > 0
                        ? Math.round(mealKcal) + ' kcal · ' + items.length + ' alimento' + (items.length !== 1 ? 's' : '')
                        : 'Sin registrar'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {items.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSaveModal({ key, items }) }}
                        className="p-1.5 text-gray-600 hover:text-gray-300 tap">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    )}
                    <svg className={'w-4 h-4 text-gray-600 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-bg-border bg-bg-card2/40">
                    {items.map((food) => (
                      <div key={food.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-bg-border/40 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate leading-tight">{food.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-600">{food.grams}g</span>
                            <span className="text-xs font-semibold text-amber-400/80">{food.calories} kcal</span>
                            <span className="text-xs text-violet-400/70">P {food.protein}g</span>
                            <span className="text-xs text-cyan-400/70">C {food.carbs}g</span>
                          </div>
                        </div>
                        <button onClick={() => handleRemove(key, food.id)}
                          className="p-1.5 text-gray-700 hover:text-red-400 tap flex-shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button onClick={() => setModal(key)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-violet-400 text-sm font-medium tap">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Añadir alimento
                    </button>
                  </div>
                )}

                {!isOpen && (
                  <div className="border-t border-bg-border">
                    <button
                      onClick={() => { setExpanded((e) => ({ ...e, [key]: true })); setModal(key) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-violet-400 text-xs font-medium transition-colors tap">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Añadir
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {!profile.weightKg && (
        <Link to="/perfil" className="mx-5 mt-4 flex items-center justify-between border border-bg-border rounded-2xl p-4 tap">
          <div>
            <p className="text-sm font-semibold text-white">Completa tu perfil</p>
            <p className="text-xs text-gray-600">Obtén macros calculados a tu medida</p>
          </div>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      <div className="h-5" />

      {modal && (
        <SearchModal meal={modal} onClose={() => setModal(null)}
          onAdd={(food) => { handleAdd(modal, food); setModal(null) }} />
      )}
      {saveModal && (
        <SaveMealModal mealKey={saveModal.key} meal={saveModal.items}
          onSave={handleSaveCombo} onClose={() => setSaveModal(null)} />
      )}
      {editSlots && (
        <MealEditor slots={slots} onSave={handleSaveSlots} onClose={() => setEditSlots(false)} />
      )}
    </div>
  )
}
`)

console.log('Dashboard written OK')
