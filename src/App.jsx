import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Diary from './pages/Diary'
import Goals from './pages/Goals'
import History from './pages/History'

export default function App() {
  return (
    <HashRouter>
      <div className="relative min-h-screen bg-gray-950 max-w-lg mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diario" element={<Diary />} />
          <Route path="/objetivos" element={<Goals />} />
          <Route path="/historial" element={<History />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
