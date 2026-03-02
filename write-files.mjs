import { writeFileSync } from 'fs'

const base = 'C:/Users/utrerj/Documents/GitHub/Fitness/src'

// ── Dashboard ──────────────────────────────────────────────────────────────
writeFileSync(base + '/pages/Dashboard.jsx', `import { useState, useCallback } from 'react'
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
`)

// ── SearchModal (updated for saved meals) ──────────────────────────────────
writeFileSync(base + '/components/SearchModal.jsx', `import { useState, useEffect, useRef } from 'react'
import { searchFoods, normalizeProduct } from '../utils/api'
import { getCustomFoods, getSavedMeals } from '../utils/storage'

function useDebounce(value, delay) {
  const [d, setD] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return d
}

function GramsInput({ value, onChange }) {
  return (
    <input type="number" min="1" max="9999" value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 bg-bg-card2 text-white text-xs text-center rounded-lg px-1 py-1.5 border border-bg-border focus:outline-none focus:border-violet-500"
    />
  )
}

function ProductRow({ product, onAdd }) {
  const [grams, setGrams] = useState(100)
  const n = normalizeProduct(product, grams)
  if (!product.product_name) return null
  return (
    <div className="flex items-center gap-3 card p-3">
      {product.image_thumb_url ? (
        <img src={product.image_thumb_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-bg-card2 flex items-center justify-center flex-shrink-0 text-2xl">🍽️</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{product.product_name}</p>
        {product.brands && <p className="text-xs text-gray-500 truncate">{product.brands}</p>}
        <p className="text-xs text-gray-600 mt-0.5">
          <span className="text-amber-400 font-semibold">{n.calories} kcal</span>
          {' · P:'}<span className="text-violet-400">{n.protein}g</span>
          {' C:'}<span className="text-cyan-400">{n.carbs}g</span>
          {' G:'}<span className="text-orange-400">{n.fat}g</span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <GramsInput value={grams} onChange={setGrams} /><span>g</span>
        </div>
        <button onClick={() => onAdd(normalizeProduct(product, grams))}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg tap">
          Añadir
        </button>
      </div>
    </div>
  )
}

function CustomFoodRow({ food, onAdd }) {
  const [grams, setGrams] = useState(100)
  const f = grams / 100
  return (
    <div className="flex items-center gap-3 card p-3">
      <div className="w-12 h-12 rounded-xl bg-violet-600/15 flex items-center justify-center flex-shrink-0 text-2xl">⭐</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{food.name}</p>
        <p className="text-xs text-gray-600 mt-0.5">
          <span className="text-amber-400 font-semibold">{Math.round(food.calories * f)} kcal</span>
          {' · P:'}<span className="text-violet-400">{Math.round(food.protein * f * 10) / 10}g</span>
          {' C:'}<span className="text-cyan-400">{Math.round(food.carbs * f * 10) / 10}g</span>
          {' G:'}<span className="text-orange-400">{Math.round(food.fat * f * 10) / 10}g</span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <GramsInput value={grams} onChange={setGrams} /><span>g</span>
        </div>
        <button onClick={() => onAdd({
          name: food.name, brand: 'Personalizado',
          calories: Math.round(food.calories * f),
          protein: Math.round(food.protein * f * 10) / 10,
          carbs: Math.round(food.carbs * f * 10) / 10,
          fat: Math.round(food.fat * f * 10) / 10, grams,
        })} className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg tap">
          Añadir
        </button>
      </div>
    </div>
  )
}

function SavedMealRow({ combo, onAdd }) {
  const total = (combo.foods ?? []).reduce((s, f) => s + (f.calories ?? 0), 0)
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-white text-sm">{combo.name}</p>
          <p className="text-xs text-gray-500">{combo.foods?.length ?? 0} alimentos · {Math.round(total)} kcal</p>
        </div>
        <button onClick={() => combo.foods?.forEach((f) => onAdd(f))}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg tap">
          Añadir todo
        </button>
      </div>
      <div className="space-y-0.5">
        {(combo.foods ?? []).map((f, i) => (
          <p key={i} className="text-xs text-gray-600">{f.name} · {f.grams}g · {f.calories} kcal</p>
        ))}
      </div>
    </div>
  )
}

const TABS = ['Buscar', 'Mis alimentos', 'Guardadas']
const MEAL_LABELS = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snacks: 'Snacks' }

export default function SearchModal({ meal, onClose, onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState(0)
  const inputRef = useRef(null)
  const debounced = useDebounce(query, 500)

  const customFoods = getCustomFoods()
  const savedMeals  = getSavedMeals()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (tab !== 0 || !debounced.trim()) { setResults([]); return }
    setLoading(true); setError(null)
    searchFoods(debounced)
      .then(({ products }) => setResults(products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [debounced, tab])

  const filteredCustom = customFoods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
  const filteredSaved  = savedMeals.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg animate-fade-in">
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 border-b border-bg-border">
        <button onClick={onClose} className="p-1.5 text-gray-400 tap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-bold text-white flex-1">Añadir a {MEAL_LABELS[meal] ?? meal}</h2>
      </div>

      <div className="flex border-b border-bg-border">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={'flex-1 py-2.5 text-xs font-semibold transition-colors ' +
              (tab === i ? 'text-violet-400 border-b-2 border-violet-500' : 'text-gray-600')}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input ref={inputRef} type="search" placeholder="Buscar..." value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-bg-card border border-bg-border text-white placeholder-gray-600 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {tab === 0 && (
          <>
            {loading && <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}
            {error && <p className="text-red-400 text-sm text-center py-6">{error}</p>}
            {!loading && !debounced && <p className="text-gray-700 text-sm text-center py-10">Escribe para buscar en Open Food Facts</p>}
            {!loading && debounced && results.length === 0 && !error && (
              <p className="text-gray-600 text-sm text-center py-10">Sin resultados para "{debounced}"</p>
            )}
            {results.map((p, i) => (
              <ProductRow key={p.code ?? i} product={p} onAdd={(food) => { onAdd(food); onClose() }} />
            ))}
          </>
        )}
        {tab === 1 && (
          <>
            {filteredCustom.length === 0 && <p className="text-gray-700 text-sm text-center py-10">Sin alimentos personalizados</p>}
            {filteredCustom.map((f) => <CustomFoodRow key={f.id} food={f} onAdd={(food) => { onAdd(food); onClose() }} />)}
          </>
        )}
        {tab === 2 && (
          <>
            {filteredSaved.length === 0 && <p className="text-gray-700 text-sm text-center py-10">Sin comidas guardadas. Guárdalas desde el diario con el icono ⭐</p>}
            {filteredSaved.map((m) => <SavedMealRow key={m.id} combo={m} onAdd={(food) => onAdd(food)} />)}
          </>
        )}
      </div>
    </div>
  )
}
`)

// ── BottomNav ──────────────────────────────────────────────────────────────
writeFileSync(base + '/components/BottomNav.jsx', `import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',         end: true,  label: 'Hoy',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/diario',   end: false, label: 'Diario',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/historial',end: false, label: 'Historial', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/perfil',   end: false, label: 'Perfil',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card/90 border-t border-bg-border backdrop-blur-xl safe-bottom max-w-lg mx-auto">
      <div className="flex">
        {TABS.map(({ to, end, label, icon }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ' +
              (isActive ? 'text-violet-400' : 'text-gray-600')
            }
          >
            {({ isActive }) => (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={isActive ? 2.5 : 1.8} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
`)

console.log('All files written OK')
