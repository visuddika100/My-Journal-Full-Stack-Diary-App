import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PenLine, Trash2, Star, ArrowLeft, Calendar, Wind, Tag } from 'lucide-react'
import { format } from 'date-fns'
import useEntryStore from '../context/entryStore'
import AICoach from '../components/AICoach'
import toast from 'react-hot-toast'

export default function EntryViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchEntry, deleteEntry, toggleFavorite } = useEntryStore()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchEntry(id).then(e => { setEntry(e); setLoading(false) })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return
    const res = await deleteEntry(id)
    if (res.success) { toast.success('Entry deleted'); navigate('/') }
    else toast.error(res.message)
  }

  const handleFav = async () => {
    await toggleFavorite(id)
    setEntry(e => ({ ...e, isFavorite: !e.isFavorite }))
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 bg-parchment-100 rounded w-1/2 mb-4" />
      <div className="h-96 bg-parchment-100 rounded-2xl" />
    </div>
  )

  if (!entry) return (
    <div className="text-center py-20">
      <p className="text-ink-400">Entry not found.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-4">Go Home</button>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleFav} className={`p-2 rounded-xl transition-colors ${entry.isFavorite ? 'text-amber-500' : 'text-ink-300 hover:text-amber-400'}`}>
            <Star size={16} className={entry.isFavorite ? 'fill-amber-400' : ''} />
          </button>
          <button onClick={() => navigate(`/entry/${id}/edit`)} className="btn-ghost flex items-center gap-2 text-sm">
            <PenLine size={14} /> Edit
          </button>
          <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-rose-50 text-ink-300 hover:text-rose-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Entry card */}
      <div className="bg-white/90 rounded-3xl border border-parchment-100 shadow-lg overflow-hidden mb-6">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-parchment-400 via-parchment-600 to-parchment-400" />

        <div className="p-8 lg:p-10">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {format(new Date(entry.entryDate), 'EEEE, MMMM d, yyyy')}
            </span>
            <span>{entry.weather}</span>
            <span className="text-xl">{entry.mood?.emoji}</span>
            <span className="text-ink-500 font-medium">{entry.mood?.label}</span>
            {entry.isFavorite && <span className="text-amber-500 flex items-center gap-1"><Star size={12} className="fill-amber-400" /> Favorite</span>}
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl text-ink-900 mb-6 leading-tight">{entry.title}</h1>

          {/* Tags */}
          {entry.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {entry.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-parchment-50 text-ink-500 border border-parchment-100 px-3 py-1 rounded-full">
                  <Tag size={10} />#{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="relative bg-parchment-50/50 rounded-2xl p-6 lg:p-8 mb-6
                          border border-parchment-100 notebook-binding">
            <div className="pl-10">
              <p className="font-hand text-xl text-ink-700 leading-[2.2em] whitespace-pre-wrap lined-paper">
                {entry.content}
              </p>
            </div>
          </div>

          {/* Word count */}
          <p className="text-xs text-ink-300 text-right">{entry.wordCount} words · Written {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}</p>
        </div>
      </div>

      {/* Photos */}
      {entry.photos?.length > 0 && (
        <div className="bg-white/90 rounded-2xl border border-parchment-100 p-6 mb-6 shadow-sm">
          <h3 className="font-serif text-xl text-ink-800 mb-4">📸 Memories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {entry.photos.map((photo, i) => (
              <div
                key={i}
                onClick={() => setLightbox(photo.url)}
                className="aspect-[4/3] rounded-xl overflow-hidden border border-parchment-100 cursor-pointer
                           hover:scale-105 hover:shadow-md transition-all"
              >
                <img src={photo.url} alt={photo.caption || `Photo ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Coach */}
      <AICoach content={entry.content} title={entry.title} entryId={id} />

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={lightbox} alt="Photo" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </motion.div>
  )
}