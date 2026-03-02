import { useState, useEffect, useRef } from 'react'
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
