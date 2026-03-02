import { useState, useEffect } from 'react'

const CORRECT_PIN = '19735546'
const SESSION_KEY = 'mf_unlocked'

export function isUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function unlock() {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export default function PinLock({ onUnlock }) {
  const [digits, setDigits] = useState('')
  const [error, setError]   = useState(false)
  const [shake, setShake]   = useState(false)

  useEffect(() => {
    if (digits.length === CORRECT_PIN.length) {
      if (digits === CORRECT_PIN) {
        unlock()
        onUnlock()
      } else {
        setShake(true)
        setError(true)
        setTimeout(() => { setDigits(''); setShake(false); setError(false) }, 700)
      }
    }
  }, [digits, onUnlock])

  function press(d) {
    if (digits.length >= CORRECT_PIN.length) return
    setDigits((prev) => prev + d)
    setError(false)
  }

  function del() {
    setDigits((prev) => prev.slice(0, -1))
    setError(false)
  }

  const KEYS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    [null,'0','del'],
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-8 animate-fade-in">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
          <span className="text-3xl font-black gradient-text">M</span>
        </div>
        <h1 className="text-2xl font-bold text-white">MacroFit</h1>
        <p className="text-sm text-gray-500">Introduce tu PIN</p>
      </div>

      {/* Dots */}
      <div className={`flex gap-4 mb-10 ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}
        style={ shake ? { animation: 'shake 0.4s ease-in-out' } : {} }>
        {Array.from({ length: CORRECT_PIN.length }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-150 ${
              i < digits.length
                ? error ? 'bg-red-500' : 'bg-violet-500 scale-110'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
        {KEYS.flat().map((k, i) => {
          if (k === null) return <div key={i} />
          if (k === 'del') return (
            <button
              key={i}
              onClick={del}
              className="h-16 rounded-2xl bg-bg-card border border-bg-border flex items-center justify-center text-gray-400 active:bg-bg-card2 transition-colors tap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )
          return (
            <button
              key={i}
              onClick={() => press(k)}
              className="h-16 rounded-2xl bg-bg-card border border-bg-border text-white text-2xl font-semibold active:bg-violet-600/20 active:border-violet-600/50 transition-all tap"
            >
              {k}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-6 text-red-400 text-sm animate-fade-in">PIN incorrecto</p>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
