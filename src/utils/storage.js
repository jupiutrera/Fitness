const KEYS = {
  GOALS:        'mf_goals',
  DIARY:        'mf_diary',
  CUSTOM_FOODS: 'mf_custom_foods',
  PROFILE:      'mf_profile',
  SAVED_MEALS:  'mf_saved_meals',
  RECENT_FOODS: 'mf_recent_foods',
  MEAL_SLOTS:   'mf_meal_slots',
  ONBOARDED:    'mf_onboarded',
}

// ── Onboarding flag ─────────────────────────────────────────────────────────

export function isOnboarded() {
  return localStorage.getItem(KEYS.ONBOARDED) === '1'
}

export function setOnboarded() {
  localStorage.setItem(KEYS.ONBOARDED, '1')
}

// ── Migration from old key names ─────────────────────────────────────────────

export function migrateFromOldKeys() {
  const OLD = {
    'macrofit_goals':        KEYS.GOALS,
    'macrofit_diary':        KEYS.DIARY,
    'macrofit_custom_foods': KEYS.CUSTOM_FOODS,
    'macrofit_profile':      KEYS.PROFILE,
    'macrofit_saved_meals':  KEYS.SAVED_MEALS,
  }
  for (const [oldKey, newKey] of Object.entries(OLD)) {
    const oldVal = localStorage.getItem(oldKey)
    if (oldVal && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldVal)
    }
    if (oldVal) localStorage.removeItem(oldKey)
  }
  // If profile exists but onboarded flag is missing, set it
  if (!isOnboarded() && localStorage.getItem(KEYS.PROFILE)) {
    setOnboarded()
  }
}

// ── Meal Slots (configurable) ───────────────────────────────────────────────

export const DEFAULT_MEAL_SLOTS = [
  { key: 'desayuno', label: 'Desayuno', time: '06–11h' },
  { key: 'almuerzo', label: 'Almuerzo', time: '12–15h' },
  { key: 'cena',     label: 'Cena',     time: '19–22h' },
  { key: 'snacks',   label: 'Snacks',   time: 'entre comidas' },
]

export function getMealSlots() {
  try {
    const raw = localStorage.getItem(KEYS.MEAL_SLOTS)
    return raw ? JSON.parse(raw) : DEFAULT_MEAL_SLOTS
  } catch { return DEFAULT_MEAL_SLOTS }
}

export function saveMealSlots(slots) {
  localStorage.setItem(KEYS.MEAL_SLOTS, JSON.stringify(slots))
}

// ── Profile ────────────────────────────────────────────────────────────────

export const DEFAULT_PROFILE = {
  name: '',
  sex: 'male',
  age: null,
  weightKg: null,
  heightCm: null,
  activityKey: 'moderate',
  goalKey: 'maintain',
}

export function getProfile() {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE)
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE
  } catch { return DEFAULT_PROFILE }
}

export function saveProfile(profile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
}

export function hasProfile() {
  const p = getProfile()
  return !!(p.age && p.weightKg && p.heightCm)
}

// ── Goals ──────────────────────────────────────────────────────────────────

export const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 }

export function getGoals() {
  try {
    const raw = localStorage.getItem(KEYS.GOALS)
    return raw ? { ...DEFAULT_GOALS, ...JSON.parse(raw) } : DEFAULT_GOALS
  } catch { return DEFAULT_GOALS }
}

export function saveGoals(goals) {
  localStorage.setItem(KEYS.GOALS, JSON.stringify(goals))
}

// ── Diary ──────────────────────────────────────────────────────────────────

export function getDiary() {
  try {
    const raw = localStorage.getItem(KEYS.DIARY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
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
  pushRecentFood(foodEntry)
}

export function removeFoodFromMeal(dateStr, meal, foodId) {
  const dayLog = getDayLog(dateStr)
  if (!dayLog.meals[meal]) return
  dayLog.meals[meal] = dayLog.meals[meal].filter((f) => f.id !== foodId)
  saveDayLog(dateStr, dayLog)
}

// ── Custom Foods ────────────────────────────────────────────────────────────

export function getCustomFoods() {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_FOODS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveCustomFood(food) {
  const foods = getCustomFoods()
  const idx = foods.findIndex((f) => f.id === food.id)
  if (idx >= 0) foods[idx] = food
  else foods.unshift({ ...food, id: food.id ?? crypto.randomUUID() })
  localStorage.setItem(KEYS.CUSTOM_FOODS, JSON.stringify(foods))
}

export function deleteCustomFood(id) {
  localStorage.setItem(KEYS.CUSTOM_FOODS, JSON.stringify(getCustomFoods().filter((f) => f.id !== id)))
}

// ── Saved Meal Combos ───────────────────────────────────────────────────────

export function getSavedMeals() {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_MEALS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveMealCombo(combo) {
  const meals = getSavedMeals()
  const idx = meals.findIndex((m) => m.id === combo.id)
  if (idx >= 0) meals[idx] = combo
  else meals.unshift({ ...combo, id: combo.id ?? crypto.randomUUID(), createdAt: Date.now() })
  localStorage.setItem(KEYS.SAVED_MEALS, JSON.stringify(meals))
}

export function deleteSavedMeal(id) {
  localStorage.setItem(KEYS.SAVED_MEALS, JSON.stringify(getSavedMeals().filter((m) => m.id !== id)))
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function dateLabel(dateStr) {
  const today     = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today)     return 'Hoy'
  if (dateStr === yesterday) return 'Ayer'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'short',
  })
}

export function computeTotals(dayLog) {
  const empty = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  return Object.values(dayLog.meals ?? {})
    .flat()
    .reduce((acc, f) => ({
      calories: acc.calories + (f.calories ?? 0),
      protein:  acc.protein  + (f.protein  ?? 0),
      carbs:    acc.carbs    + (f.carbs    ?? 0),
      fat:      acc.fat      + (f.fat      ?? 0),
    }), empty)
}

// ── Recent Foods ────────────────────────────────────────────────────────────

export function getRecentFoods() {
  try {
    const raw = localStorage.getItem(KEYS.RECENT_FOODS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function pushRecentFood(food) {
  const recents = getRecentFoods().filter((f) => f.name !== food.name)
  recents.unshift(food)
  localStorage.setItem(KEYS.RECENT_FOODS, JSON.stringify(recents.slice(0, 15)))
}

export function getStreak() {
  const diary = getDiary()
  let streak = 0
  let date = new Date()
  for (let i = 0; i < 365; i++) {
    const key = date.toISOString().slice(0, 10)
    const log = diary[key]
    const hasFood = log && Object.values(log.meals ?? {}).flat().length > 0
    if (!hasFood) break
    streak++
    date = new Date(date.getTime() - 86400000)
  }
  return streak
}
