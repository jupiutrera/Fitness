import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',         end: true,  label: 'Hoy',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/diario',   end: false, label: 'Diario',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/historial',end: false, label: 'Historial', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/perfil',   end: false, label: 'Perfil',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card/90 border-t border-bg-border backdrop-blur-xl safe-bottom max-w-lg mx-auto">
      <div className="flex">
        {TABS.map(({ to, end, label, icon }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ' +
              (isActive ? 'text-violet-400' : 'text-gray-600')
            }
          >
            {({ isActive }) => (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={isActive ? 2.5 : 1.8} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
