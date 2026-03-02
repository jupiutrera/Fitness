import { useState } from 'react'
import {
  getProfile, saveProfile, getGoals, saveGoals,
  getCustomFoods, saveCustomFood, deleteCustomFood,
  getSavedMeals, saveMealCombo, deleteSavedMeal,
} from '../utils/storage'
import { calcTDEE, bmi, bmiLabel, ACTIVITY_LEVELS, GOALS as GOAL_LIST } from '../utils/tdee'
import SearchModal from '../components/SearchModal'

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-gray-400 px-1 mb-2">{title}</p>
      <div className="card overflow-hidden">{children}</div>
    </div>
  )
}

function Row({ label, value, onEdit }) {
  return (
    <button onClick={onEdit} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-bg-border last:border-0 tap">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{value}</span>
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

function CustomFoodForm({ onSave, onCancel, initial }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [calories, setCalories] = useState(initial?.calories ?? '')
  const [protein, setProtein]   = useState(initial?.protein  ?? '')
  const [carbs, setCarbs]       = useState(initial?.carbs    ?? '')
  const [fat, setFat]           = useState(initial?.fat      ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 animate-fade-in">
      <div className="w-full bg-bg-card rounded-t-3xl p-5 pb-safe space-y-4 border-t border-bg-border animate-slide-up">
        <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-2" />
        <h3 className="font-bold text-white text-lg">{initial ? 'Editar alimento' : 'Nuevo alimento'}</h3>
        <div>
          <label className="text-xs text-gray-500">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tortilla 3 huevos" className="input-dark mt-1" />
        </div>
        <p className="text-xs text-gray-600">Valores por 100 g</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Calorías (kcal)', calories, setCalories],
            ['Proteína (g)',    protein,  setProtein],
            ['Carbos (g)',      carbs,    setCarbs],
            ['Grasas (g)',      fat,      setFat],
          ].map(([label, val, set]) => (
            <div key={label}>
              <label className="text-xs text-gray-500">{label}</label>
              <input type="number" min={0} value={val} onChange={(e) => set(e.target.value)} className="input-dark mt-1" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-bg-card2 border border-bg-border text-gray-300 font-medium tap">Cancelar</button>
          <button
            onClick={() => onSave({ id: initial?.id, name: name.trim(), calories: Number(calories), protein: Number(protein), carbs: Number(carbs), fat: Number(fat) })}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-30 tap"
          >Guardar</button>
        </div>
      </div>
    </div>
  )
}

function MacroInput({ label, value, onChange, unit = 'g', step = 5 }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border last:border-0">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, value - step))} className="w-8 h-8 rounded-full bg-bg-card2 border border-bg-border text-white text-lg font-light tap">−</button>
        <span className="w-16 text-center text-sm font-semibold text-white">{value} <span className="text-xs text-gray-600">{unit}</span></span>
        <button onClick={() => onChange(value + step)} className="w-8 h-8 rounded-full bg-bg-card2 border border-bg-border text-white text-lg font-light tap">+</button>
      </div>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function SavedMealForm({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [foods, setFoods] = useState([])
  const [search, setSearch] = useState(false)

  const total = foods.reduce((s, f) => s + (f.calories ?? 0), 0)

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end bg-black/70 animate-fade-in">
        <div className="w-full bg-bg-card border-t border-bg-border rounded-t-3xl p-5 pb-safe animate-slide-up max-h-[85vh] flex flex-col">
          <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-5 flex-shrink-0" />
          <h3 className="font-bold text-white text-lg mb-4 flex-shrink-0">Nuevo combo</h3>

          <div className="flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs text-gray-500">Nombre del combo</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Desayuno de semana"
                className="input-dark mt-1"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500">Alimentos</label>
                {foods.length > 0 && (
                  <span className="text-xs text-gray-600">{Math.round(total)} kcal</span>
                )}
              </div>
              {foods.length === 0 ? (
                <p className="text-xs text-gray-700 py-2">Sin alimentos añadidos</p>
              ) : (
                <div className="space-y-1 mb-2">
                  {foods.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-bg-card2 rounded-xl px-3 py-2 border border-bg-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{f.name}</p>
                        <p className="text-xs text-gray-600">{f.grams}g · {f.calories} kcal</p>
                      </div>
                      <button onClick={() => setFoods((prev) => prev.filter((_, idx) => idx !== i))}
                        className="p-1 text-gray-700 hover:text-red-400 tap flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setSearch(true)}
                className="w-full flex items-center gap-2 py-2.5 rounded-xl border border-dashed border-bg-border text-gray-500 text-sm font-medium tap justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Añadir alimento
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-4 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-bg-card2 border border-bg-border text-gray-300 font-medium tap">Cancelar</button>
            <button
              onClick={() => { onSave({ name: name.trim() || 'Combo', foods }); onClose() }}
              disabled={foods.length === 0}
              className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-30 tap"
            >Guardar</button>
          </div>
        </div>
      </div>

      {search && (
        <SearchModal
          meal="combo"
          onClose={() => setSearch(false)}
          onAdd={(food) => { setFoods((prev) => [...prev, food]); setSearch(false) }}
        />
      )}
    </>
  )
}

export default function Profile() {
  const [profile, setProfile] = useState(getProfile)
  const [goals, setGoals]     = useState(getGoals)
  const [customFoods, setCustomFoods] = useState(getCustomFoods)
  const [savedMeals, setSavedMeals]   = useState(getSavedMeals)
  const [foodForm, setFoodForm] = useState(null) // null | {} | food object
  const [mealForm, setMealForm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [goalsMode, setGoalsMode] = useState('auto') // 'auto' | 'manual'

  const tdee = calcTDEE(profile)
  const bmiVal = bmi(profile.weightKg, profile.heightCm)
  const bmiInfo = bmiVal ? bmiLabel(bmiVal) : null

  function updateProfile(key, val) {
    const next = { ...profile, [key]: val }
    setProfile(next)
    saveProfile(next)
    if (goalsMode === 'auto') {
      const t = calcTDEE(next)
      if (t) {
        const newGoals = { calories: t.target, protein: t.protein, carbs: t.carbs, fat: t.fat }
        setGoals(newGoals)
        saveGoals(newGoals)
      }
    }
  }

  function handleSaveGoals() {
    saveGoals(goals)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function applyTDEE() {
    if (!tdee) return
    const g = { calories: tdee.target, protein: tdee.protein, carbs: tdee.carbs, fat: tdee.fat }
    setGoals(g)
    saveGoals(g)
    setGoalsMode('auto')
  }

  function handleSaveFood(food) {
    saveCustomFood(food)
    setCustomFoods(getCustomFoods())
    setFoodForm(null)
  }

  function handleSaveMealCombo(combo) {
    saveMealCombo(combo)
    setSavedMeals(getSavedMeals())
  }

  const actLabel = ACTIVITY_LEVELS.find((a) => a.key === profile.activityKey)?.label ?? '-'
  const goalLabel = GOAL_LIST.find((g) => g.key === profile.goalKey)?.label ?? '-'

  return (
    <div className="min-h-screen pb-nav bg-bg">
      {/* Header */}
      <div className="px-4 pt-8 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-violet-300">
              {profile.name ? profile.name[0].toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.name || 'Mi perfil'}</h1>
            <p className="text-sm text-gray-500">
              {profile.weightKg ? `${profile.weightKg} kg` : ''}
              {profile.heightCm ? ` · ${profile.heightCm} cm` : ''}
              {profile.age ? ` · ${profile.age} años` : ''}
            </p>
          </div>
        </div>

        {/* Stats row */}
        {tdee && (
          <div className="grid grid-cols-5 gap-2 mt-5">
            <div className="col-span-2 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 text-center">
              <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{tdee.tdee}</p>
              <p className="text-xs text-gray-600 leading-tight">TDEE</p>
              <p className="text-xs font-medium" style={{ color: '#f59e0b99' }}>kcal</p>
            </div>
            <div className="col-span-2 card p-3 text-center">
              <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>{tdee.bmr}</p>
              <p className="text-xs text-gray-600 leading-tight">BMR</p>
              <p className="text-xs font-medium" style={{ color: '#8b5cf699' }}>kcal</p>
            </div>
            <div className="col-span-1 card p-3 text-center">
              <p className="text-lg font-bold" style={{ color: bmiInfo?.color ?? '#6b7280' }}>{bmiVal ? `${bmiVal}` : '-'}</p>
              <p className="text-xs text-gray-600 leading-tight">IMC</p>
              <p className="text-xs font-medium" style={{ color: (bmiInfo?.color ?? '#6b7280') + '99' }}>{bmiInfo?.label ?? ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Personal data */}
      <div className="px-4">
        <Section title="Datos personales">
          <div className="px-4 py-3 border-b border-bg-border">
            <label className="text-xs text-gray-500">Nombre</label>
            <input
              value={profile.name}
              onChange={(e) => updateProfile('name', e.target.value)}
              placeholder="Tu nombre"
              className="input-dark mt-1"
            />
          </div>
          <div className="flex border-b border-bg-border">
            {['male','female'].map((s, i) => (
              <button
                key={s}
                onClick={() => updateProfile('sex', s)}
                className={`flex-1 py-3 text-sm font-semibold transition-all tap ${
                  i === 0 ? 'border-r border-bg-border' : ''
                } ${
                  profile.sex === s ? 'text-violet-400' : 'text-gray-500'
                }`}
              >
                {s === 'male' ? 'Hombre' : 'Mujer'}
              </button>
            ))}
          </div>
          {[
            { label: 'Edad', key: 'age', unit: 'años', type: 'number' },
            { label: 'Peso', key: 'weightKg', unit: 'kg', type: 'number' },
            { label: 'Altura', key: 'heightCm', unit: 'cm', type: 'number' },
          ].map(({ label, key, unit }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3 border-b border-bg-border last:border-0">
              <span className="text-sm text-gray-400">{label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={profile[key] ?? ''}
                  onChange={(e) => updateProfile(key, Number(e.target.value))}
                  className="w-20 bg-bg-card2 text-white text-right text-sm rounded-lg px-2 py-1.5 border border-bg-border focus:outline-none focus:border-violet-600"
                />
                <span className="text-xs text-gray-600 w-8">{unit}</span>
              </div>
            </div>
          ))}
        </Section>

        {/* Activity & Goal */}
        <Section title="Estilo de vida">
          <div className="px-4 py-3 border-b border-bg-border">
            <label className="text-xs text-gray-500 mb-2 block">Nivel de actividad</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => updateProfile('activityKey', a.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all tap ${
                    profile.activityKey === a.key
                      ? 'bg-violet-600/20 border border-violet-500 text-violet-300'
                      : 'bg-bg-card2 border border-bg-border text-gray-400'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 py-3">
            <label className="text-xs text-gray-500 mb-2 block">Objetivo</label>
            <div className="flex gap-2">
              {GOAL_LIST.map((g) => (
                <button
                  key={g.key}
                  onClick={() => updateProfile('goalKey', g.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all tap ${
                    profile.goalKey === g.key
                      ? 'bg-violet-600/20 border border-violet-500 text-violet-300'
                      : 'bg-bg-card2 border border-bg-border text-gray-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Goals */}
        <Section title="Objetivos diarios">
          {tdee && (
            <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Objetivo calculado: <span className="text-violet-400 font-bold">{tdee.target} kcal</span></p>
                <p className="text-xs text-gray-500">P:{tdee.protein}g · C:{tdee.carbs}g · G:{tdee.fat}g</p>
              </div>
              <button onClick={applyTDEE} className="text-xs bg-violet-600/20 border border-violet-600/40 text-violet-400 px-3 py-1.5 rounded-xl font-semibold tap">
                Aplicar
              </button>
            </div>
          )}
          <MacroInput label="Calorías"      value={goals.calories} onChange={(v) => setGoals((g) => ({ ...g, calories: v }))} unit="kcal" step={50} />
          <MacroInput label="Proteína"      value={goals.protein}  onChange={(v) => setGoals((g) => ({ ...g, protein: v }))}  />
          <MacroInput label="Carbohidratos" value={goals.carbs}    onChange={(v) => setGoals((g) => ({ ...g, carbs: v }))}    />
          <MacroInput label="Grasas"        value={goals.fat}      onChange={(v) => setGoals((g) => ({ ...g, fat: v }))}      />
          <div className="px-4 py-3">
            <button
              onClick={handleSaveGoals}
              className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all tap ${saved ? 'bg-emerald-600' : 'bg-violet-600'}`}
            >
              {saved ? '✓ Guardado' : 'Guardar objetivos'}
            </button>
          </div>
        </Section>

        {/* Custom Foods */}
        <Section title="Mis alimentos">
          <button
            onClick={() => setFoodForm({})}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-bg-border text-violet-400 tap"
          >
            <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Crear alimento</span>
          </button>
          {customFoods.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-600 text-sm">Sin alimentos personalizados</div>
          ) : (
            customFoods.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-4 py-3 border-b border-bg-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.calories} kcal · P:{f.protein}g · C:{f.carbs}g · G:{f.fat}g <span className="text-gray-700">/100g</span></p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setFoodForm(f)} className="p-2 text-gray-600 hover:text-white tap">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => { deleteCustomFood(f.id); setCustomFoods(getCustomFoods()) }} className="p-2 text-gray-700 hover:text-red-400 tap">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </Section>

        {/* Saved meal combos */}
        <Section title="Comidas guardadas">
          <button
            onClick={() => setMealForm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-bg-border text-violet-400 tap"
          >
            <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Crear combo</span>
          </button>
          {savedMeals.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-600 text-sm">Sin comidas guardadas</div>
          ) : (
            savedMeals.map((m) => {
              const total = (m.foods ?? []).reduce((s, f) => s + (f.calories ?? 0), 0)
              return (
                <div key={m.id} className="flex items-center justify-between px-4 py-3 border-b border-bg-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.foods?.length ?? 0} alimentos · {Math.round(total)} kcal</p>
                  </div>
                  <button onClick={() => { deleteSavedMeal(m.id); setSavedMeals(getSavedMeals()) }} className="p-2 text-gray-700 hover:text-red-400 tap">
                    <TrashIcon />
                  </button>
                </div>
              )
            })
          )}
        </Section>
      </div>

      {foodForm !== null && (
        <CustomFoodForm
          initial={Object.keys(foodForm).length ? foodForm : null}
          onSave={handleSaveFood}
          onCancel={() => setFoodForm(null)}
        />
      )}
      {mealForm && (
        <SavedMealForm
          onSave={handleSaveMealCombo}
          onClose={() => setMealForm(false)}
        />
      )}
    </div>
  )
}
