import { useState, useEffect, useRef } from 'react'
import { searchFoods, normalizeProduct } from '../utils/api'
import { getCustomFoods, getSavedMeals, getRecentFoods } from '../utils/storage'
import BarcodeScanner from './BarcodeScanner'

function useDebounce(v, d) {
  const [dv, setDv] = useState(v)
  useEffect(() => { const t = setTimeout(() => setDv(v), d); return () => clearTimeout(t) }, [v, d])
  return dv
}

function GramsInput({ value, onChange }) {
  return (
    <input type="number" min="1" max="9999" value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-14 bg-bg-card2 text-white text-xs text-center rounded-lg px-1 py-1.5 border border-bg-border focus:outline-none focus:border-violet-500"
    />
  )
}

function MacroChip({ val, color }) {
  return <span className="text-xs font-semibold" style={{ color }}>{val}</span>
}

function ProductRow({ product, onAdd }) {
  const [grams, setGrams] = useState(100)
  const n = normalizeProduct(product, grams)
  if (!product.product_name) return null
  return (
    <div className="flex items-center gap-3 card p-3">
      {product.image_thumb_url
        ? <img src={product.image_thumb_url} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-bg-border" />
        : <div className="w-11 h-11 rounded-xl bg-bg-card2 flex items-center justify-center flex-shrink-0 border border-bg-border">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
            </svg>
          </div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate leading-tight">{product.product_name}</p>
        {product.brands && <p className="text-xs text-gray-600 truncate">{product.brands}</p>}
        <div className="flex items-center gap-2 mt-0.5">
          <MacroChip val={n.calories + ' kcal'} color="#f59e0b" />
          <span className="text-gray-700">·</span>
          <MacroChip val={'P ' + n.protein + 'g'} color="#a78bfa" />
          <MacroChip val={'C ' + n.carbs + 'g'} color="#22d3ee" />
          <MacroChip val={'G ' + n.fat + 'g'} color="#fb923c" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <GramsInput value={grams} onChange={setGrams} /><span>g</span>
        </div>
        <button onClick={() => onAdd(normalizeProduct(product, grams))}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg tap">
          +
        </button>
      </div>
    </div>
  )
}

function CustomFoodRow({ food, onAdd }) {
  const [grams, setGrams] = useState(100)
  const f = grams / 100
  const n = { calories: Math.round(food.calories * f), protein: Math.round(food.protein * f * 10) / 10, carbs: Math.round(food.carbs * f * 10) / 10, fat: Math.round(food.fat * f * 10) / 10 }
  return (
    <div className="flex items-center gap-3 card p-3">
      <div className="w-11 h-11 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{food.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <MacroChip val={n.calories + ' kcal'} color="#f59e0b" />
          <span className="text-gray-700">·</span>
          <MacroChip val={'P ' + n.protein + 'g'} color="#a78bfa" />
          <MacroChip val={'C ' + n.carbs + 'g'} color="#22d3ee" />
          <MacroChip val={'G ' + n.fat + 'g'} color="#fb923c" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <GramsInput value={grams} onChange={setGrams} /><span>g</span>
        </div>
        <button onClick={() => onAdd({ name: food.name, brand: 'Personalizado', ...n, grams })}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg tap">+</button>
      </div>
    </div>
  )
}

function RecentRow({ food, onAdd }) {
  const [grams, setGrams] = useState(food.grams ?? 100)
  const factor = (food.per100 ?? food) ? grams / (food.grams ?? 100) : 1
  function getAdded() {
    if (food.per100) {
      const f = grams / 100
      return { ...food, grams, calories: Math.round(food.per100.calories * f), protein: Math.round(food.per100.protein * f * 10) / 10, carbs: Math.round(food.per100.carbs * f * 10) / 10, fat: Math.round(food.per100.fat * f * 10) / 10 }
    }
    const f = grams / (food.grams ?? 100)
    return { ...food, grams, calories: Math.round(food.calories * f), protein: Math.round(food.protein * f * 10) / 10, carbs: Math.round(food.carbs * f * 10) / 10, fat: Math.round(food.fat * f * 10) / 10 }
  }
  const n = getAdded()
  return (
    <div className="flex items-center gap-3 card p-3">
      <div className="w-11 h-11 rounded-xl bg-bg-card2 border border-bg-border flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{food.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <MacroChip val={n.calories + ' kcal'} color="#f59e0b" />
          <span className="text-gray-700">·</span>
          <MacroChip val={'P ' + n.protein + 'g'} color="#a78bfa" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <GramsInput value={grams} onChange={setGrams} /><span>g</span>
        </div>
        <button onClick={() => onAdd(getAdded())}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg tap">+</button>
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
          className="bg-violet-600 text-white text-xs font-bold px-3 py-2 rounded-xl tap">
          Añadir todo
        </button>
      </div>
      {(combo.foods ?? []).map((f, i) => (
        <p key={i} className="text-xs text-gray-600 leading-relaxed">{f.name} · {f.grams}g · {f.calories} kcal</p>
      ))}
    </div>
  )
}

const TABS = [
  { id: 'search', label: 'Buscar' },
  { id: 'recent', label: 'Recientes' },
  { id: 'custom', label: 'Mis alimentos' },
  { id: 'saved',  label: 'Guardadas' },
]
const MEAL_LABELS = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snacks: 'Snacks' }

export default function SearchModal({ meal, onClose, onAdd }) {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [tab, setTab]       = useState('search')
  const [scanner, setScanner] = useState(false)
  const inputRef = useRef(null)
  const debounced = useDebounce(query, 500)

  const customFoods = getCustomFoods()
  const savedMeals  = getSavedMeals()
  const recentFoods = getRecentFoods()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (tab !== 'search' || !debounced.trim()) { setResults([]); return }
    setLoading(true); setError(null)
    searchFoods(debounced)
      .then(({ products }) => setResults(products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [debounced, tab])

  const q = query.toLowerCase()
  const filteredCustom  = customFoods.filter((f) => f.name.toLowerCase().includes(q))
  const filteredSaved   = savedMeals.filter((m) => m.name.toLowerCase().includes(q))
  const filteredRecent  = recentFoods.filter((f) => !q || f.name.toLowerCase().includes(q))

  if (scanner) {
    return (
      <BarcodeScanner
        onClose={() => setScanner(false)}
        onAdd={(food) => { onAdd(food); onClose() }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 border-b border-bg-border">
        <button onClick={onClose} className="p-1.5 text-gray-500 tap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-bold text-white flex-1 text-sm">Añadir a {MEAL_LABELS[meal] ?? meal}</h2>
        {/* Barcode scan button */}
        <button onClick={() => setScanner(true)}
          className="flex items-center gap-1.5 bg-violet-600/15 border border-violet-600/30 text-violet-400 text-xs font-semibold px-3 py-2 rounded-xl tap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12v.01M12 4h.01M4 4h4m0 0v4m0 0H4m4 0h4" />
          </svg>
          Escanear
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bg-border overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={'flex-shrink-0 px-4 py-2.5 text-xs font-semibold transition-colors ' +
              (tab === id ? 'text-violet-400 border-b-2 border-violet-500' : 'text-gray-600')}>
            {label}
            {id === 'recent' && recentFoods.length > 0 && (
              <span className="ml-1 text-gray-700">({recentFoods.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input ref={inputRef} type="search" placeholder="Buscar alimento..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-bg-card border border-bg-border text-white placeholder-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-600"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {tab === 'search' && (
          <>
            {loading && <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}
            {error && <p className="text-red-400 text-sm text-center py-6">{error}</p>}
            {!loading && !debounced && <p className="text-gray-700 text-sm text-center py-10">Escribe para buscar en Open Food Facts</p>}
            {!loading && debounced && !error && results.length === 0 && <p className="text-gray-700 text-sm text-center py-10">Sin resultados para "{debounced}"</p>}
            {results.map((p, i) => <ProductRow key={p.code ?? i} product={p} onAdd={(f) => { onAdd(f); onClose() }} />)}
          </>
        )}
        {tab === 'recent' && (
          <>
            {filteredRecent.length === 0 && <p className="text-gray-700 text-sm text-center py-10">Sin alimentos recientes</p>}
            {filteredRecent.map((f, i) => <RecentRow key={i} food={f} onAdd={(fd) => { onAdd(fd); onClose() }} />)}
          </>
        )}
        {tab === 'custom' && (
          <>
            {filteredCustom.length === 0 && <p className="text-gray-700 text-sm text-center py-10">Sin alimentos personalizados</p>}
            {filteredCustom.map((f) => <CustomFoodRow key={f.id} food={f} onAdd={(fd) => { onAdd(fd); onClose() }} />)}
          </>
        )}
        {tab === 'saved' && (
          <>
            {filteredSaved.length === 0 && <p className="text-gray-700 text-sm text-center py-10">Sin comidas guardadas. Guárdalas desde el diario.</p>}
            {filteredSaved.map((m) => <SavedMealRow key={m.id} combo={m} onAdd={(f) => onAdd(f)} />)}
          </>
        )}
      </div>
    </div>
  )
}
