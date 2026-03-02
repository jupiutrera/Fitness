import { useState } from 'react'
import { saveProfile, saveGoals } from '../utils/storage'
import { calcTDEE, ACTIVITY_LEVELS, GOALS } from '../utils/tdee'

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', sex: 'male', age: '', weightKg: '', heightCm: '',
    activityKey: 'moderate', goalKey: 'maintain',
  })

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })) }

  function next() { setStep((s) => s + 1) }
  function back() { setStep((s) => s - 1) }

  function finish() {
    const profile = {
      ...form,
      age: Number(form.age),
      weightKg: Number(form.weightKg),
      heightCm: Number(form.heightCm),
    }
    saveProfile(profile)
    const tdee = calcTDEE(profile)
    if (tdee) saveGoals({ calories: tdee.target, protein: tdee.protein, carbs: tdee.carbs, fat: tdee.fat })
    onDone()
  }

  const steps = [
    // 0 — Welcome
    <div key={0} className="flex flex-col items-center text-center animate-slide-up">
      <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center mb-6">
        <span className="text-4xl font-black gradient-text">M</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Bienvenido a MacroFit</h1>
      <p className="text-gray-400 text-sm leading-relaxed mb-8">
        Vamos a configurar tu perfil para calcular tus macros y calorías ideales.
        Solo tarda 1 minuto.
      </p>
      <div className="w-full space-y-3">
        <label className="text-xs text-gray-400 font-medium tracking-wide uppercase">¿Cómo te llamas?</label>
        <input
          className="input-dark text-center text-lg font-semibold"
          placeholder="Tu nombre"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3 mt-4">
          {['male', 'female'].map((s) => (
            <button
              key={s}
              onClick={() => set('sex', s)}
              className={`py-4 rounded-2xl border text-sm font-semibold transition-all tap ${
                form.sex === s
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                  : 'bg-bg-card border-bg-border text-gray-400'
              }`}
            >
              {s === 'male' ? 'Hombre' : 'Mujer'}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // 1 — Body stats
    <div key={1} className="flex flex-col animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-1">Datos físicos</h2>
      <p className="text-gray-500 text-sm mb-6">Para calcular tu metabolismo basal</p>
      <div className="space-y-4">
        {[
          { label: 'Edad', key: 'age', unit: 'años', min: 10, max: 99, placeholder: '25' },
          { label: 'Peso', key: 'weightKg', unit: 'kg', min: 30, max: 300, placeholder: '70' },
          { label: 'Altura', key: 'heightCm', unit: 'cm', min: 100, max: 250, placeholder: '175' },
        ].map(({ label, key, unit, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="number"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="input-dark flex-1"
              />
              <span className="text-gray-500 text-sm w-8">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // 2 — Activity
    <div key={2} className="flex flex-col animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-1">Nivel de actividad</h2>
      <p className="text-gray-500 text-sm mb-6">¿Cuánto te mueves a la semana?</p>
      <div className="space-y-2">
        {ACTIVITY_LEVELS.map((a) => (
          <button
            key={a.key}
            onClick={() => set('activityKey', a.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all tap ${
              form.activityKey === a.key
                ? 'bg-violet-600/15 border-violet-500/60 text-white'
                : 'bg-bg-card border-bg-border text-gray-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-violet-400">{a.label.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{a.label}</p>
              <p className="text-xs text-gray-500">{a.desc}</p>
            </div>
            {form.activityKey === a.key && (
              <div className="ml-auto w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>,

    // 3 — Goal
    <div key={3} className="flex flex-col animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-1">Objetivo</h2>
      <p className="text-gray-500 text-sm mb-6">¿Qué quieres conseguir?</p>
      <div className="space-y-3">
        {GOALS.map((g) => (
          <button
            key={g.key}
            onClick={() => set('goalKey', g.key)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all tap ${
              form.goalKey === g.key
                ? 'bg-violet-600/15 border-violet-500/60 text-white'
                : 'bg-bg-card border-bg-border text-gray-300'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-violet-400">{g.label.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold">{g.label}</p>
              <p className="text-xs text-gray-500">{g.desc}</p>
            </div>
            {form.goalKey === g.key && (
              <div className="ml-auto w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>,

    // 4 — Result
    (() => {
      const profile = { ...form, age: Number(form.age), weightKg: Number(form.weightKg), heightCm: Number(form.heightCm) }
      const tdee = calcTDEE(profile)
      const goalLabel = GOALS.find((g) => g.key === form.goalKey)?.label ?? ''
      return (
        <div key={4} className="flex flex-col animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-1">
            {form.name ? `¡Listo, ${form.name}!` : '¡Listo!'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">Aquí están tus macros calculados</p>
          {tdee ? (
            <div className="space-y-3">
              <div className="bg-violet-600/10 border border-violet-600/30 rounded-2xl p-5 text-center mb-2">
                <p className="text-xs text-violet-400 uppercase tracking-wide font-semibold mb-1">Calorías objetivo · {goalLabel}</p>
                <p className="text-5xl font-black gradient-text">{tdee.target}</p>
                <p className="text-xs text-gray-500 mt-1">TDEE base: {tdee.tdee} kcal · BMR: {tdee.bmr} kcal</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Proteína', val: tdee.protein, color: '#a78bfa', unit: 'g' },
                  { label: 'Carbos',   val: tdee.carbs,   color: '#22d3ee', unit: 'g' },
                  { label: 'Grasas',   val: tdee.fat,     color: '#fb923c', unit: 'g' },
                ].map(({ label, val, color, unit }) => (
                  <div key={label} className="bg-bg-card border border-bg-border rounded-xl p-3 text-center">
                    <p className="text-xl font-bold" style={{ color }}>{val}{unit}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">Podrás ajustarlos manualmente en tu perfil</p>
            </div>
          ) : (
            <div className="bg-bg-card border border-bg-border rounded-2xl p-6 text-center">
              <p className="text-gray-400">Rellena tus datos para ver el cálculo</p>
            </div>
          )}
        </div>
      )
    })(),
  ]

  const canNext = [
    form.name.trim().length > 0,
    form.age && form.weightKg && form.heightCm,
    true,
    true,
    true,
  ][step]

  return (
    <div className="min-h-screen bg-bg flex flex-col px-6 py-8">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8 items-center">
        {steps.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
            i === step ? 'w-6 bg-violet-500' : i < step ? 'w-2 bg-violet-500' : 'w-2 bg-bg-border'
          }`} />
        ))}
      </div>

      <div className="flex-1">{steps[step]}</div>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={back} className="flex-1 py-3.5 rounded-2xl bg-bg-card border border-bg-border text-gray-300 font-semibold tap">
            Atrás
          </button>
        )}
        <button
          onClick={step === steps.length - 1 ? finish : next}
          disabled={!canNext}
          className="flex-1 py-3.5 rounded-2xl bg-violet-600 text-white font-bold disabled:opacity-30 tap transition-all"
        >
          {step === steps.length - 1 ? '¡Empezar!' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}
