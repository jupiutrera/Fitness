const BASE = 'https://world.openfoodfacts.org'

/**
 * Search foods via Open Food Facts
 * @param {string} query
 * @param {number} page
 * @returns {Promise<{products: Array, count: number}>}
 */
export async function searchFoods(query, page = 1) {
  if (!query.trim()) return { products: [], count: 0 }

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page,
    page_size: '20',
    fields: 'code,product_name,brands,nutriments,serving_size,image_thumb_url',
    lc: 'es',
    // prefer results with complete nutriment data
    sort_by: 'unique_scans_n',
  })

  const res = await fetch(`${BASE}/cgi/search.pl?${params}`)
  if (!res.ok) throw new Error('Error buscando alimentos')
  const data = await res.json()
  return { products: data.products ?? [], count: data.count ?? 0 }
}

/**
 * Get a product by barcode
 */
export async function getProductByBarcode(barcode) {
  const res = await fetch(`${BASE}/api/v0/product/${barcode}.json`)
  if (!res.ok) throw new Error('Producto no encontrado')
  const data = await res.json()
  if (data.status !== 1) throw new Error('Producto no encontrado')
  return data.product
}

/**
 * Normalize a raw OFF product into our internal food format
 * @param {object} product - raw OFF product
 * @param {number} grams - serving grams (default 100)
 */
export function normalizeProduct(product, grams = 100) {
  const n = product.nutriments ?? {}
  const per100 = {
    calories: n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0,
    protein: n['proteins_100g'] ?? n['proteins'] ?? 0,
    carbs: n['carbohydrates_100g'] ?? n['carbohydrates'] ?? 0,
    fat: n['fat_100g'] ?? n['fat'] ?? 0,
  }

  const factor = grams / 100
  return {
    offId: product.code ?? null,
    name: product.product_name || 'Sin nombre',
    brand: product.brands || '',
    image: product.image_thumb_url || null,
    per100,
    grams,
    calories: Math.round(per100.calories * factor),
    protein: Math.round(per100.protein * factor * 10) / 10,
    carbs: Math.round(per100.carbs * factor * 10) / 10,
    fat: Math.round(per100.fat * factor * 10) / 10,
  }
}
