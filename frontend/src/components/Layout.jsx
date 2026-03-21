import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, PenLine, BarChart2, LogOut, Star,
  Menu, X, Flame, ChevronRight, Search
} from 'lucide-react'
import useAuthStore from '../context/authStore'
import useEntryStore from '../context/entryStore'
import { format } from 'date-fns'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { entries, stats, fetchEntries, fetchStats } = useEntryStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchEntries()
    fetchStats()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search)}`)
      setSearchOpen(false)
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ME'

  return (
    <div className="flex min-h-screen bg-parchment-50 paper-texture">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white/90 backdrop-blur-sm
                       border-r border-parchment-200 z-40 flex flex-col shadow-lg"
          >
            {/* Logo */}
            <div className="p-6 border-b border-parchment-100">
              <h1 className="font-serif text-2xl text-parchment-700 leading-none">✦ My Journal</h1>
              <p className="text-xs text-ink-400 mt-1 tracking-widest uppercase">Write · Reflect · Grow</p>
            </div>

            {/* New Entry Button */}
            <div className="p-4">
              <button
                onClick={() => navigate('/entry/new')}
                className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
              >
                <PenLine size={15} />
                New Entry
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-3 space-y-1">
              {[
                { to: '/', icon: BookOpen, label: 'All Entries' },
                { to: '/progress', icon: BarChart2, label: 'Progress' },
              ].map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-parchment-100 text-parchment-700 font-medium'
                        : 'text-ink-500 hover:bg-parchment-50 hover:text-ink-800'
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Recent Entries */}
            <div className="flex-1 overflow-y-auto px-3 mt-4">
              <p className="text-xs text-ink-300 uppercase tracking-widest px-3 mb-2 font-medium">Recent</p>
              {entries.slice(0, 8).map(entry => (
                <button
                  key={entry._id}
                  onClick={() => navigate(`/entry/${entry._id}`)}
                  className={`w-full text-left px-3 py-2 rounded-xl mb-1 transition-all duration-150
                    ${location.pathname === `/entry/${entry._id}`
                      ? 'bg-parchment-100 text-ink-800'
                      : 'hover:bg-parchment-50 text-ink-500 hover:text-ink-800'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{entry.title}</span>
                    <span className="text-base flex-shrink-0">{entry.mood?.emoji || '📝'}</span>
                  </div>
                  <p className="text-xs text-ink-300 mt-0.5">
                    {format(new Date(entry.entryDate), 'MMM d')}
                  </p>
                </button>
              ))}
            </div>

            {/* User + Stats footer */}
            <div className="p-4 border-t border-parchment-100">
              {/* Streak */}
              {stats && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-sm text-ink-600">
                    <strong className="text-parchment-700">{stats.streak}</strong> day streak
                  </span>
                </div>
              )}
              {/* Stats pills */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { num: stats?.totalEntries ?? 0, label: 'Entries' },
                  { num: stats?.totalWords > 999 ? `${(stats.totalWords/1000).toFixed(1)}k` : (stats?.totalWords ?? 0), label: 'Words' },
                  { num: stats?.streak ?? 0, label: 'Streak' },
                ].map(({ num, label }) => (
                  <div key={label} className="bg-parchment-50 rounded-xl p-2 text-center">
                    <div className="font-serif text-lg text-parchment-700 leading-none">{num}</div>
                    <div className="text-xs text-ink-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {/* User */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-parchment-200 flex items-center justify-center
                                text-xs font-medium text-parchment-700 flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{user?.name}</p>
                  <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                </div>
                <button onClick={logout} className="text-ink-300 hover:text-ink-600 transition-colors">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-parchment-100
                           flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="p-2 rounded-lg hover:bg-parchment-50 text-ink-400 hover:text-ink-700 transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-sm text-ink-400 font-hand text-lg">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="p-2 rounded-lg hover:bg-parchment-50 text-ink-400 hover:text-ink-700 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </header>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b border-parchment-100 px-6 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="py-3 flex gap-3">
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search your entries..."
                  className="input-base flex-1"
                />
                <button type="submit" className="btn-primary text-sm px-4">Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}