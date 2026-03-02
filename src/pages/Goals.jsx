import { useState } from 'react'
import { getGoals, saveGoals, DEFAULT_GOALS, getCustomFoods, saveCustomFood, deleteCustomFood } from '../utils/storage'

function MacroInput({ label, emoji, value, onChange, unit = 'g', max = 999 }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2">
        <span>{emoji}</span>
        <span className="text-sm font-medium text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - (unit === 'kcal' ? 50 : 5)))}
          className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg"
        >−</button>
        <input
          type="number"
          value={value}
          min={0}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 bg-gray-800 text-white text-center rounded-lg px-2 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
        />
        <span className="text-xs text-gray-500 w-6">{unit}</span>
        <button
          onClick={() => onChange(Math.min(max, value + (unit === 'kcal' ? 50 : 5)))}
          className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg"
        >+</button>
      </div>
    </div>
  )
}

const PRESETS = [
  { label: 'Pérdida de grasa', calories: 1600, protein: 160, carbs: 130, fat: 55 },
  { label: 'Mantenimiento', calories: 2000, protein: 130, carbs: 200, fat: 65 },
  { label: 'Volumen', calories: 2800, protein: 180, carbs: 320, fat: 85 },
]

function CustomFoodForm({ onSave, onCancel, initial }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [calories, setCalories] = useState(initial?.calories ?? 0)
  const [protein, setProtein] = useState(initial?.protein ?? 0)
  const [carbs, setCarbs] = useState(initial?.carbs ?? 0)
  const [fat, setFat] = useState(initial?.fat ?? 0)

  function handleSave() {
    if (!name.trim()) return
    onSave({ id: initial?.id, name: name.trim(), calories, protein, carbs, fat })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full bg-gray-900 rounded-t-2xl p-5 space-y-4 pb-safe">
        <h3 className="font-semibold text-white">{initial ? 'Editar alimento' : 'Nuevo alimento'}</h3>
        <div>
          <label className="text-xs text-gray-400">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Tortilla de 3 huevos"
            className="mt-1 w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <p className="text-xs text-gray-500">Valores por 100g</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Calorías (kcal)', val: calories, set: setCalories },
            { label: 'Proteína (g)', val: protein, set: setProtein },
            { label: 'Carbos (g)', val: carbs, set: setCarbs },
            { label: 'Grasas (g)', val: fat, set: setFat },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="text-xs text-gray-400">{label}</label>
              <input
                type="number"
                min={0}
                value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="mt-1 w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState(getGoals)
  const [saved, setSaved] = useState(false)
  const [customFoods, setCustomFoods] = useState(getCustomFoods)
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [editingFood, setEditingFood] = useState(null)

  function update(key, val) {
    setGoals((g) => ({ ...g, [key]: Number(val) }))
    setSaved(false)
  }

  function handleSave() {
    saveGoals(goals)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handlePreset(p) {
    setGoals(p)
    setSaved(false)
  }

  function handleSaveFood(food) {
    saveCustomFood(food)
    setCustomFoods(getCustomFoods())
    setShowFoodForm(false)
    setEditingFood(null)
  }

  function handleDeleteFood(id) {
    deleteCustomFood(id)
    setCustomFoods(getCustomFoods())
  }

  return (
    <div className="min-h-screen pb-nav bg-gray-950">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Objetivos</h1>
        <p className="text-sm text-gray-400 mt-1">Ajusta tus metas diarias</p>
      </div>

      {/* Presets */}
      <div className="px-4 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Presets rápidos</p>
        <div className="flex gap-2 overflow-x-auto">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className="flex-shrink-0 px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals form */}
      <div className="mx-4 bg-gray-900 rounded-2xl px-4 mb-4">
        <MacroInput label="Calorías" emoji="🔥" value={goals.calories} onChange={(v) => update('calories', v)} unit="kcal" max={9999} />
        <MacroInput label="Proteína" emoji="💪" value={goals.protein} onChange={(v) => update('protein', v)} />
        <MacroInput label="Carbohidratos" emoji="🌾" value={goals.carbs} onChange={(v) => update('carbs', v)} />
        <MacroInput label="Grasas" emoji="🧈" value={goals.fat} onChange={(v) => update('fat', v)} />
      </div>

      {/* Calorie check */}
      <div className="mx-4 mb-4 bg-gray-900/60 rounded-xl px-4 py-3">
        <p className="text-xs text-gray-500">Calorías calculadas desde macros</p>
        <p className="text-sm text-gray-300 mt-0.5">
          {goals.protein * 4 + goals.carbs * 4 + goals.fat * 9} kcal
          <span className="text-xs text-gray-600 ml-1">(P×4 + C×4 + G×9)</span>
        </p>
      </div>

      {/* Save button */}
      <div className="px-4 mb-8">
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all ${
            saved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {saved ? '✓ Guardado' : 'Guardar objetivos'}
        </button>
      </div>

      {/* Custom foods */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold text-gray-300">Mis alimentos</p>
            <p className="text-xs text-gray-500">Crea alimentos que no están en la base de datos</p>
          </div>
          <button
            onClick={() => setShowFoodForm(true)}
            className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {customFoods.length === 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">Sin alimentos personalizados</p>
            <p className="text-gray-600 text-xs mt-1">Pulsa + para crear uno</p>
          </div>
        )}

        <div className="space-y-2">
          {customFoods.map((food) => (
            <div key={food.id} className="bg-gray-900 rounded-2xl flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{food.name}</p>
                <p className="text-xs text-gray-500">
                  {food.calories} kcal · P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g <span className="text-gray-600">/ 100g</span>
                </p>
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => { setEditingFood(food); setShowFoodForm(true) }}
                  className="p-1.5 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteFood(food.id)}
                  className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showFoodForm && (
        <CustomFoodForm
          initial={editingFood}
          onSave={handleSaveFood}
          onCancel={() => { setShowFoodForm(false); setEditingFood(null) }}
        />
      )}
    </div>
  )
}
