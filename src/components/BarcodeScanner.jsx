import { useEffect, useRef, useState, useCallback } from 'react'
import { getProductByBarcode, normalizeProduct } from '../utils/api'

// Lazy-load @zxing/browser to keep initial bundle small
async function getReader() {
  const { BrowserMultiFormatReader } = await import('@zxing/browser')
  return new BrowserMultiFormatReader()
}

export default function BarcodeScanner({ onAdd, onClose }) {
  const videoRef  = useRef(null)
  const readerRef = useRef(null)
  const scanning  = useRef(true)

  const [phase, setPhase]   = useState('scanning') // 'scanning' | 'loading' | 'found' | 'error'
  const [product, setProduct] = useState(null)
  const [grams, setGrams]   = useState(100)
  const [errMsg, setErrMsg] = useState('')

  const stopScanner = useCallback(() => {
    scanning.current = false
    try { readerRef.current?.reset() } catch (_) {}
  }, [])

  useEffect(() => {
    let mounted = true

    getReader().then((reader) => {
      readerRef.current = reader
      if (!mounted) return

      reader.decodeFromConstraints(
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
        videoRef.current,
        (result, err) => {
          if (!scanning.current || !mounted) return
          if (result) {
            scanning.current = false
            const barcode = result.getText()
            setPhase('loading')
            getProductByBarcode(barcode)
              .then((p) => { if (mounted) { setProduct(p); setPhase('found') } })
              .catch(() => { if (mounted) { setErrMsg('Producto no encontrado en la base de datos'); setPhase('error') } })
          }
        },
      ).catch((e) => {
        if (mounted) {
          setErrMsg(e?.message?.includes('permission')
            ? 'Sin permiso de cámara. Actívalo en tu navegador.'
            : 'No se pudo acceder a la cámara.')
          setPhase('error')
        }
      })
    })

    return () => { mounted = false; stopScanner() }
  }, [stopScanner])

  function handleAdd() {
    if (!product) return
    const normalized = normalizeProduct(product, grams)
    onAdd(normalized)
    onClose()
  }

  function retryScanner() {
    scanning.current = true
    setPhase('scanning')
    setProduct(null)
    setErrMsg('')
    stopScanner()
    // Re-mount triggers useEffect again — force by remounting parent in SearchModal
  }

  const normalized = product ? normalizeProduct(product, grams) : null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 absolute top-0 left-0 right-0 z-10">
        <button onClick={() => { stopScanner(); onClose() }}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-sm">Escanear código de barras</span>
      </div>

      {/* Camera view */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Scanning frame */}
        <div className="relative w-64 h-40">
          {/* corners */}
          {[['top-0 left-0', 'border-t-2 border-l-2 rounded-tl-lg'],
            ['top-0 right-0', 'border-t-2 border-r-2 rounded-tr-lg'],
            ['bottom-0 left-0', 'border-b-2 border-l-2 rounded-bl-lg'],
            ['bottom-0 right-0', 'border-b-2 border-r-2 rounded-br-lg'],
          ].map(([pos, cls]) => (
            <div key={pos} className={`absolute ${pos} w-8 h-8 border-violet-400 ${cls}`} />
          ))}
          {/* scan line */}
          {phase === 'scanning' && (
            <div className="absolute left-2 right-2 h-0.5 bg-violet-400/70 rounded-full"
              style={{ top: '50%', boxShadow: '0 0 8px #7c3aed', animation: 'scanLine 2s ease-in-out infinite' }} />
          )}
        </div>
        <p className="text-white/70 text-xs mt-4 font-medium">
          {phase === 'scanning' ? 'Apunta al código de barras del producto' : ''}
        </p>
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-30px); opacity: 0.4; }
          50% { transform: translateY(30px); opacity: 1; }
        }
      `}</style>

      {/* Loading */}
      {phase === 'loading' && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm font-medium">Buscando producto...</p>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="absolute inset-x-0 bottom-0 bg-bg-card border-t border-bg-border rounded-t-3xl p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">No encontrado</p>
            <p className="text-xs text-gray-500 mt-1">{errMsg}</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => { stopScanner(); onClose() }}
              className="flex-1 py-3 rounded-xl bg-bg-card2 border border-bg-border text-gray-300 font-medium tap">
              Cancelar
            </button>
            <button onClick={retryScanner}
              className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold tap">
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Found product */}
      {phase === 'found' && normalized && (
        <div className="absolute inset-x-0 bottom-0 bg-bg-card border-t border-bg-border rounded-t-3xl p-5 animate-slide-up">
          <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-4" />

          <div className="flex items-center gap-3 mb-4">
            {product?.image_front_small_url || product?.image_thumb_url ? (
              <img src={product.image_front_small_url ?? product.image_thumb_url} alt=""
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-bg-border" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-bg-card2 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{product?.product_name || 'Producto'}</p>
              {product?.brands && <p className="text-xs text-gray-500 truncate">{product.brands}</p>}
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Kcal',     val: normalized.calories, color: '#f59e0b' },
              { label: 'Proteína', val: normalized.protein + 'g', color: '#a78bfa' },
              { label: 'Carbos',   val: normalized.carbs + 'g', color: '#22d3ee' },
              { label: 'Grasas',   val: normalized.fat + 'g', color: '#fb923c' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-bg-card2 rounded-xl p-2.5 text-center border border-bg-border">
                <p className="text-sm font-bold" style={{ color }}>{val}</p>
                <p className="text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>

          {/* Grams input */}
          <div className="flex items-center gap-3 mb-4 bg-bg-card2 rounded-xl p-3 border border-bg-border">
            <span className="text-sm text-gray-400 flex-1">Cantidad</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setGrams((g) => Math.max(1, g - 10))}
                className="w-8 h-8 rounded-full bg-bg-card border border-bg-border text-white tap">−</button>
              <input type="number" value={grams} min={1} onChange={(e) => setGrams(Number(e.target.value))}
                className="w-16 text-center text-sm font-bold text-white bg-transparent focus:outline-none" />
              <button onClick={() => setGrams((g) => g + 10)}
                className="w-8 h-8 rounded-full bg-bg-card border border-bg-border text-white tap">+</button>
              <span className="text-xs text-gray-600">g</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={retryScanner}
              className="flex-1 py-3 rounded-xl bg-bg-card2 border border-bg-border text-gray-300 font-medium tap">
              Escanear otro
            </button>
            <button onClick={handleAdd}
              className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold tap">
              Añadir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
