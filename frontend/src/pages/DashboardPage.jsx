import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine, Star, Search, Filter, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import useEntryStore from '../context/entryStore'
import useAuthStore from '../context/authStore'
import toast from 'react-hot-toast'

const MOODS = ['Happy','Sad','Frustrated','Grateful','Tired','Excited','Peaceful','Anxious','Proud','Inspired']
const ACCENT_COLORS = ['border-t-parchment-500','border-t-amber-400','border-t-teal-500','border-t-violet-400','border-t-rose-400','border-t-sky-400']

export default function DashboardPage() {
  const { entries, loading, pagination, fetchEntries, deleteEntry, toggleFavorite, setFilters, filters } = useEntryStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  useEffect(() => {
    const search = searchParams.get('search') || ''
    setLocalSearch(search)
    fetchEntries({ search })
  }, [searchParams])

  const handleFilter = (key, val) => {
    const updated = { ...filters, [key]: val }
    setFilters(updated)
    fetchEntries(updated)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this entry?')) return
    const res = await deleteEntry(id)
    if (res.success) toast.success('Entry deleted')
    else toast.error(res.message)
  }

  const handleFav = (e, id) => {
    e.stopPropagation()
    toggleFavorite(id)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl text-ink-900">
            {greeting}, <span className="text-parchment-600">{user?.name?.split(' ')[0]}</span> ✦
          </h2>
          <p className="text-ink-400 mt-1 text-sm font-hand text-lg">
            {format(new Date(), "EEEE, MMMM do yyyy")}
          </p>
        </div>
        <button
          onClick={() => navigate('/entry/new')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <PenLine size={16} />
          Write Today
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={localSearch}
            onChange={e => { setLocalSearch(e.target.value); handleFilter('search', e.target.value) }}
            placeholder="Search entries..."
            className="input-base pl-9 py-2 text-sm"
          />
        </div>

        <button
          onClick={() => setShowFilters(s => !s)}
          className={`btn-ghost flex items-center gap-2 text-sm py-2 ${showFilters ? 'bg-parchment-50 border-parchment-400' : ''}`}
        >
          <Filter size={14} /> Filters
        </button>

        {filters.favorite && (
          <button onClick={() => handleFilter('favorite', false)} className="btn-ghost text-sm py-2 flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-400" /> Favorites
            <span className="text-ink-300">×</span>
          </button>
        )}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white/80 rounded-2xl border border-parchment-100 p-4 flex flex-wrap gap-3">
              <div>
                <p className="text-xs text-ink-400 mb-2 font-medium uppercase tracking-wider">Mood</p>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map(m => (
                    <button
                      key={m}
                      onClick={() => handleFilter('mood', filters.mood === m ? '' : m)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        filters.mood === m
                          ? 'bg-parchment-600 text-white border-parchment-600'
                          : 'border-parchment-200 text-ink-500 hover:border-parchment-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => handleFilter('favorite', !filters.favorite)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                    filters.favorite ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-parchment-200 text-ink-500'
                  }`}
                >
                  <Star size={12} className={filters.favorite ? 'fill-amber-400 text-amber-400' : ''} />
                  Favorites only
                </button>
              </div>
              <button
                onClick={() => { setFilters({ search: '', mood: '', tag: '', favorite: false }); fetchEntries({}) }}
                className="text-xs text-ink-400 hover:text-ink-700 self-end underline ml-auto"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 rounded-2xl border border-parchment-100 p-6 animate-pulse">
              <div className="h-3 bg-parchment-100 rounded w-1/3 mb-3" />
              <div className="h-5 bg-parchment-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-parchment-100 rounded w-full mb-1" />
              <div className="h-3 bg-parchment-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">📖</div>
          <h3 className="font-serif text-2xl text-ink-700 mb-2">Your story starts here</h3>
          <p className="text-ink-400 text-sm mb-6">Write your first journal entry and begin your journey.</p>
          <button onClick={() => navigate('/entry/new')} className="btn-primary">
            Write First Entry
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {entries.map((entry, idx) => (
            <motion.div
              key={entry._id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              onClick={() => navigate(`/entry/${entry._id}`)}
              className={`card cursor-pointer p-6 border-t-4 ${ACCENT_COLORS[idx % ACCENT_COLORS.length]}
                         group hover:-translate-y-1 hover:shadow-lg relative overflow-hidden`}
            >
              {/* Hover actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => handleFav(e, entry._id)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white transition-colors"
                >
                  <Star size={13} className={entry.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-ink-300'} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/entry/${entry._id}/edit`) }}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white transition-colors"
                >
                  <PenLine size={13} className="text-ink-400" />
                </button>
                <button
                  onClick={e => handleDelete(e, entry._id)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-ink-300 uppercase tracking-wider">
                    {format(new Date(entry.entryDate), 'EEE, MMM d')}
                  </p>
                  <h3 className="font-serif text-lg text-ink-800 mt-0.5 leading-snug pr-6">
                    {entry.title}
                  </h3>
                </div>
                <span className="text-2xl flex-shrink-0">{entry.mood?.emoji || '📝'}</span>
              </div>

              {/* Tags */}
              {entry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {entry.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-parchment-50 text-ink-400 rounded-full border border-parchment-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-parchment-50">
                <span className="text-xs text-ink-300">{entry.wordCount || 0} words</span>
                <div className="flex items-center gap-2">
                  {entry.photos?.length > 0 && (
                    <span className="text-xs text-ink-300">📷 {entry.photos.length}</span>
                  )}
                  <span className="text-xs text-ink-300">{entry.weather}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchEntries({ page: i + 1 })}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                pagination.page === i + 1
                  ? 'bg-parchment-600 text-white'
                  : 'bg-white border border-parchment-100 text-ink-500 hover:border-parchment-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}