const KEYS = {
  GOALS: 'macrofit_goals',
  DIARY: 'macrofit_diary',
  CUSTOM_FOODS: 'macrofit_custom_foods',
}

// ── Goals ──────────────────────────────────────────────────────────────────

export const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
}

export function getGoals() {
  try {
    const raw = localStorage.getItem(KEYS.GOALS)
    return raw ? { ...DEFAULT_GOALS, ...JSON.parse(raw) } : DEFAULT_GOALS
  } catch {
    return DEFAULT_GOALS
  }
}

export function saveGoals(goals) {
  localStorage.setItem(KEYS.GOALS, JSON.stringify(goals))
}

// ── Diary ──────────────────────────────────────────────────────────────────

export function getDiary() {
  try {
    const raw = localStorage.getItem(KEYS.DIARY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getDayLog(dateStr) {
  const diary = getDiary()
  return diary[dateStr] ?? { meals: { desayuno: [], almuerzo: [], cena: [], snacks: [] } }
}

export function saveDayLog(dateStr, dayLog) {
  const diary = getDiary()
  diary[dateStr] = dayLog
  localStorage.setItem(KEYS.DIARY, JSON.stringify(diary))
}

export function addFoodToMeal(dateStr, meal, foodEntry) {
  const dayLog = getDayLog(dateStr)
  if (!dayLog.meals[meal]) dayLog.meals[meal] = []
  dayLog.meals[meal].push({ ...foodEntry, id: crypto.randomUUID(), addedAt: Date.now() })
  saveDayLog(dateStr, dayLog)
}

export function removeFoodFromMeal(dateStr, meal, foodId) {
  const dayLog = getDayLog(dateStr)
  if (!dayLog.meals[meal]) return
  dayLog.meals[meal] = dayLog.meals[meal].filter((f) => f.id !== foodId)
  saveDayLog(dateStr, dayLog)
}

export function updateFoodInMeal(dateStr, meal, foodId, updates) {
  const dayLog = getDayLog(dateStr)
  if (!dayLog.meals[meal]) return
  dayLog.meals[meal] = dayLog.meals[meal].map((f) =>
    f.id === foodId ? { ...f, ...updates } : f,
  )
  saveDayLog(dateStr, dayLog)
}

// ── Custom Foods ────────────────────────────────────────────────────────────

export function getCustomFoods() {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_FOODS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomFood(food) {
  const foods = getCustomFoods()
  const existing = foods.findIndex((f) => f.id === food.id)
  if (existing >= 0) foods[existing] = food
  else foods.unshift({ ...food, id: crypto.randomUUID() })
  localStorage.setItem(KEYS.CUSTOM_FOODS, JSON.stringify(foods))
}

export function deleteCustomFood(id) {
  const foods = getCustomFoods().filter((f) => f.id !== id)
  localStorage.setItem(KEYS.CUSTOM_FOODS, JSON.stringify(foods))
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function dateLabel(dateStr) {
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today) return 'Hoy'
  if (dateStr === yesterday) return 'Ayer'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

export function computeTotals(dayLog) {
  const empty = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  return Object.values(dayLog.meals ?? {})
    .flat()
    .reduce((acc, f) => ({
      calories: acc.calories + (f.calories ?? 0),
      protein: acc.protein + (f.protein ?? 0),
      carbs: acc.carbs + (f.carbs ?? 0),
      fat: acc.fat + (f.fat ?? 0),
    }), empty)
}
