import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, ScanLine, GitBranch, BarChart3, Info, HeartPulse } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Overview', icon: Activity, end: true },
  { to: '/detect', label: 'Detect', icon: ScanLine },
  { to: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/about', label: 'About', icon: Info },
]

export default function Layout() {
  const loc = useLocation()
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-extrabold tracking-tight">AnemiaFusionNet</div>
              <div className="text-[11px] font-medium text-ink-500">Multimodal Anemia Detection</div>
            </div>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-t border-ink-100 px-3 py-2 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-600 hover:bg-ink-100'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </header>

      <main key={loc.pathname} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-ink-500 sm:flex-row">
          <div>AnemiaFusionNet — Research prototype. Not a medical device.</div>
          <div>Built with multimodal CNN + NFHS-5 geo-risk fusion.</div>
        </div>
      </footer>
    </div>
  )
}
