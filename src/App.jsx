import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import PinLock, { isUnlocked } from './components/PinLock'
import Onboarding from './components/Onboarding'
import Dashboard from './pages/Dashboard'
import Diary from './pages/Diary'
import History from './pages/History'
import Profile from './pages/Profile'
import { isOnboarded, setOnboarded } from './utils/storage'

export default function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [onboarded, setOnboardedState] = useState(isOnboarded)

  if (!unlocked) return <PinLock onUnlock={() => setUnlocked(true)} />
  if (!onboarded) return <Onboarding onDone={() => { setOnboarded(); setOnboardedState(true) }} />

  return (
    <HashRouter>
      <div className="relative min-h-screen bg-bg max-w-lg mx-auto">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/diario"   element={<Diary />} />
          <Route path="/historial"element={<History />} />
          <Route path="/perfil"   element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
