/**
 * Mifflin-St Jeor BMR + Harris activity multipliers
 * + macro splits by goal
 */

export const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'Sedentario',     desc: 'Poco o ningún ejercicio',           multiplier: 1.2   },
  { key: 'light',       label: 'Ligero',          desc: 'Ejercicio 1-3 días/semana',         multiplier: 1.375 },
  { key: 'moderate',    label: 'Moderado',        desc: 'Ejercicio 3-5 días/semana',         multiplier: 1.55  },
  { key: 'active',      label: 'Activo',          desc: 'Ejercicio 6-7 días/semana',         multiplier: 1.725 },
  { key: 'very_active', label: 'Muy activo',      desc: 'Trabajo físico intenso + ejercicio',multiplier: 1.9   },
]

export const GOALS = [
  { key: 'cut',    label: 'Definición',    desc: 'Perder grasa manteniendo músculo', kcalDelta: -0.20 },
  { key: 'maintain', label: 'Mantenimiento', desc: 'Mantener peso y composición',   kcalDelta: 0    },
  { key: 'bulk',   label: 'Volumen',       desc: 'Ganar masa muscular',              kcalDelta: +0.12 },
]

/** Protein g per kg of bodyweight by goal */
const PROTEIN_PER_KG = { cut: 2.4, maintain: 1.8, bulk: 2.0 }
/** Fat % of total kcal */
const FAT_PCT        = { cut: 0.28, maintain: 0.28, bulk: 0.25 }

/**
 * Calculate TDEE and recommended macros
 * @param {object} profile
 */
export function calcTDEE(profile) {
  const { sex, age, weightKg, heightCm, activityKey, goalKey } = profile
  if (!weightKg || !heightCm || !age) return null

  // BMR
  const bmr = sex === 'female'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5

  const activityEntry = ACTIVITY_LEVELS.find((a) => a.key === activityKey) ?? ACTIVITY_LEVELS[1]
  const goalEntry     = GOALS.find((g) => g.key === goalKey) ?? GOALS[1]

  const tdee    = Math.round(bmr * activityEntry.multiplier)
  const target  = Math.round(tdee * (1 + goalEntry.kcalDelta))

  const protein = Math.round(weightKg * PROTEIN_PER_KG[goalKey ?? 'maintain'])
  const fat     = Math.round((target * FAT_PCT[goalKey ?? 'maintain']) / 9)
  const carbs   = Math.round((target - protein * 4 - fat * 9) / 4)

  return {
    bmr: Math.round(bmr),
    tdee,
    target,
    protein: Math.max(protein, 50),
    carbs:   Math.max(carbs, 20),
    fat:     Math.max(fat, 20),
  }
}

export function bmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null
  const val = weightKg / ((heightCm / 100) ** 2)
  return Math.round(val * 10) / 10
}

export function bmiLabel(bmi) {
  if (bmi < 18.5) return { label: 'Bajo peso', color: '#60a5fa' }
  if (bmi < 25)   return { label: 'Normal',     color: '#34d399' }
  if (bmi < 30)   return { label: 'Sobrepeso',  color: '#fbbf24' }
  return              { label: 'Obesidad',   color: '#f87171' }
}
