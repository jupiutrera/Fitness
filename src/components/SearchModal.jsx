import { useState, useEffect, useRef, useCallback } from 'react'
import { searchFoods, normalizeProduct } from '../utils/api'
import { getCustomFoods } from '../utils/storage'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function GramsInput({ value, onChange }) {
  return (
    <input
      type="number"
      min="1"
      max="9999"
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 bg-gray-700 text-white text-xs text-center rounded px-1 py-1 border border-gray-600 focus:outline-none focus:border-indigo-500"
    />
  )
}

function ProductRow({ product, onAdd }) {
  const [grams, setGrams] = useState(100)
  const normalized = normalizeProduct(product, grams)

  if (!product.product_name) return null

  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
      {product.image_thumb_url ? (
        <img src={product.image_thumb_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🍽️</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{product.product_name}</p>
        {product.brands && <p className="text-xs text-gray-400 truncate">{product.brands}</p>}
        <p className="text-xs text-gray-500 mt-0.5">
          {normalized.calories} kcal · P:{normalized.protein}g · C:{normalized.carbs}g · G:{normalized.fat}g
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <GramsInput value={grams} onChange={setGrams} />
          <span>g</span>
        </div>
        <button
          onClick={() => onAdd(normalizeProduct(product, grams))}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors"
        >
          Añadir
        </button>
      </div>
    </div>
  )
}

function CustomFoodRow({ food, onAdd }) {
  const [grams, setGrams] = useState(100)
  const factor = grams / 100

  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
      <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">⭐</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{food.name}</p>
        <p className="text-xs text-gray-400 truncate">Alimento personalizado</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {Math.round(food.calories * factor)} kcal · P:{Math.round(food.protein * factor * 10) / 10}g · C:{Math.round(food.carbs * factor * 10) / 10}g · G:{Math.round(food.fat * factor * 10) / 10}g
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <GramsInput value={grams} onChange={setGrams} />
          <span>g</span>
        </div>
        <button
          onClick={() => onAdd({
            name: food.name, brand: 'Personalizado',
            calories: Math.round(food.calories * factor),
            protein: Math.round(food.protein * factor * 10) / 10,
            carbs: Math.round(food.carbs * factor * 10) / 10,
            fat: Math.round(food.fat * factor * 10) / 10,
            grams,
          })}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors"
        >
          Añadir
        </button>
      </div>
    </div>
  )
}

export default function SearchModal({ meal, onClose, onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('search') // 'search' | 'custom'
  const customFoods = getCustomFoods()
  const inputRef = useRef(null)
  const debounced = useDebounce(query, 500)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!debounced.trim()) { setResults([]); return }
    setLoading(true)
    setError(null)
    searchFoods(debounced)
      .then(({ products }) => setResults(products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [debounced])

  const filtered = customFoods.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()),
  )

  const MEAL_LABELS = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snacks: 'Snacks' }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-safe border-b border-gray-800">
        <button onClick={onClose} className="text-gray-400 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-semibold text-white">
          Añadir a {MEAL_LABELS[meal] ?? meal}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {['search', 'custom'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'
            }`}
          >
            {t === 'search' ? '🔍 Buscar alimento' : '⭐ Mis alimentos'}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="p-4 pb-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Buscar alimento..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
        {tab === 'search' && (
          <>
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {error && <p className="text-red-400 text-sm text-center py-4">{error}</p>}
            {!loading && !error && results.length === 0 && debounced && (
              <p className="text-gray-500 text-sm text-center py-8">Sin resultados para "{debounced}"</p>
            )}
            {!loading && !debounced && (
              <p className="text-gray-600 text-sm text-center py-8">Escribe para buscar alimentos en Open Food Facts</p>
            )}
            {results.map((p, i) => (
              <ProductRow key={p.code ?? i} product={p} onAdd={(food) => { onAdd(food); onClose() }} />
            ))}
          </>
        )}

        {tab === 'custom' && (
          <>
            {filtered.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-8">
                {query ? 'Sin coincidencias' : 'Aún no tienes alimentos personalizados.\nCrea uno desde "Objetivos → Mis alimentos".'}
              </p>
            )}
            {filtered.map((f) => (
              <CustomFoodRow key={f.id} food={f} onAdd={(food) => { onAdd(food); onClose() }} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
