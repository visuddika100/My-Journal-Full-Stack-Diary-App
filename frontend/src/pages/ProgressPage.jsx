import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, BookOpen, PenLine, TrendingUp, Award } from 'lucide-react'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import useEntryStore from '../context/entryStore'
import useAuthStore from '../context/authStore'

function StatCard({ icon: Icon, label, value, color = 'parchment', delay = 0 }) {
  const colorMap = {
    parchment: 'bg-parchment-50 text-parchment-700 border-parchment-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border p-6 ${colorMap[color]}`}
    >
      <Icon size={20} className="mb-3 opacity-70" />
      <p className="font-serif text-3xl font-bold leading-none mb-1">{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </motion.div>
  )
}

export default function ProgressPage() {
  const { stats, fetchStats, entries, fetchEntries } = useEntryStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchStats()
    fetchEntries({ limit: 100 })
  }, [])

  // Build 35-day calendar
  const today = startOfDay(new Date())
  const days = eachDayOfInterval({ start: subDays(today, 34), end: today })
  const entryDates = new Set(
    entries.map(e => format(startOfDay(new Date(e.entryDate)), 'yyyy-MM-dd'))
  )

  const last30 = stats?.last30Days || []
  const maxWords = Math.max(...last30.map(d => d.words || 0), 1)

  const moodEmojis = { Happy: '😊', Sad: '😔', Grateful: '🥰', Excited: '✨', Peaceful: '😌', Tired: '😴', Frustrated: '😤', Anxious: '😰', Proud: '🥲', Inspired: '💡' }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-ink-900">Your Progress ✦</h2>
        <p className="text-ink-400 mt-1 text-sm">Track your English writing journey</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Total Entries" value={stats?.totalEntries ?? 0} color="parchment" delay={0} />
        <StatCard icon={PenLine} label="Total Words" value={stats?.totalWords ? (stats.totalWords > 999 ? `${(stats.totalWords/1000).toFixed(1)}k` : stats.totalWords) : 0} color="teal" delay={0.1} />
        <StatCard icon={TrendingUp} label="Avg Words/Entry" value={stats?.avgWords ?? 0} color="violet" delay={0.2} />
        <StatCard icon={Flame} label="Day Streak 🔥" value={stats?.streak ?? 0} color="amber" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Writing calendar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 rounded-2xl border border-parchment-100 p-6 shadow-sm"
        >
          <h3 className="font-serif text-xl text-ink-800 mb-4">Writing Calendar</h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-ink-300 font-medium py-1">{d}</div>
            ))}
          </div>
          {/* Pad to Monday */}
          <div className="grid grid-cols-7 gap-1">
            {/* leading empty cells */}
            {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd')
              const hasEntry = entryDates.has(key)
              const isToday = key === format(today, 'yyyy-MM-dd')
              return (
                <div
                  key={key}
                  title={format(day, 'MMM d, yyyy')}
                  className={`aspect-square rounded-md transition-all ${
                    isToday
                      ? 'bg-violet-500 ring-2 ring-violet-300 ring-offset-1'
                      : hasEntry
                      ? 'bg-parchment-500 hover:bg-parchment-600'
                      : 'bg-parchment-100 hover:bg-parchment-200'
                  }`}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-xs text-ink-400">
              <div className="w-3 h-3 rounded-sm bg-parchment-100" /> No entry
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-400">
              <div className="w-3 h-3 rounded-sm bg-parchment-500" /> Wrote ✦
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-400">
              <div className="w-3 h-3 rounded-sm bg-violet-500" /> Today
            </span>
          </div>
        </motion.div>

        {/* Word count chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 rounded-2xl border border-parchment-100 p-6 shadow-sm"
        >
          <h3 className="font-serif text-xl text-ink-800 mb-4">Words Written (Last 30 Days)</h3>
          {last30.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-ink-300 text-sm">
              No data yet — start writing!
            </div>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {last30.map((d, i) => (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-1 group" title={`${d._id}: ${d.words} words`}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.round((d.words / maxWords) * 100)}%` }}
                    transition={{ delay: 0.5 + i * 0.02, duration: 0.5, ease: 'easeOut' }}
                    className="w-full bg-parchment-400 group-hover:bg-parchment-600 rounded-t-sm transition-colors min-h-[2px]"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-xs text-ink-300 mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </motion.div>
      </div>

      {/* Mood distribution */}
      {stats?.topMoods?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 rounded-2xl border border-parchment-100 p-6 shadow-sm mb-6"
        >
          <h3 className="font-serif text-xl text-ink-800 mb-5">Your Mood Journey</h3>
          <div className="space-y-3">
            {stats.topMoods.map(m => {
              const pct = Math.round((m.count / stats.totalEntries) * 100)
              return (
                <div key={m._id} className="flex items-center gap-3">
                  <span className="text-2xl w-8">{moodEmojis[m._id] || '📝'}</span>
                  <span className="text-sm text-ink-600 w-20">{m._id}</span>
                  <div className="flex-1 bg-parchment-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-parchment-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-ink-400 w-16 text-right">{m.count} entries ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/90 rounded-2xl border border-parchment-100 p-6 shadow-sm"
      >
        <h3 className="font-serif text-xl text-ink-800 mb-5">
          <Award size={18} className="inline mr-2 text-amber-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { icon: '📖', label: 'First Entry', unlocked: (stats?.totalEntries || 0) >= 1 },
            { icon: '✍️', label: '10 Entries', unlocked: (stats?.totalEntries || 0) >= 10 },
            { icon: '📚', label: '50 Entries', unlocked: (stats?.totalEntries || 0) >= 50 },
            { icon: '🔥', label: '7-Day Streak', unlocked: (stats?.streak || 0) >= 7 },
            { icon: '💎', label: '30-Day Streak', unlocked: (stats?.streak || 0) >= 30 },
            { icon: '📝', label: '1,000 Words', unlocked: (stats?.totalWords || 0) >= 1000 },
            { icon: '📜', label: '10,000 Words', unlocked: (stats?.totalWords || 0) >= 10000 },
            { icon: '🌟', label: 'Word Master', unlocked: (stats?.totalWords || 0) >= 50000 },
          ].map(a => (
            <div
              key={a.label}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                a.unlocked
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-parchment-50 border-parchment-100 text-ink-300 opacity-50'
              }`}
            >
              <span className={`text-3xl ${!a.unlocked && 'grayscale'}`}>{a.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{a.label}</span>
              {a.unlocked && <span className="text-xs text-amber-600">✓ Unlocked</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}