import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import { Save, ArrowLeft, Star, Trash2, Tag, CloudSun } from 'lucide-react'
import { format } from 'date-fns'
import useEntryStore from '../context/entryStore'
import AICoach from '../components/AICoach'
import PhotoUpload from '../components/PhotoUpload'
import toast from 'react-hot-toast'

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '🥰', label: 'Grateful' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '✨', label: 'Excited' },
  { emoji: '😌', label: 'Peaceful' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '🥲', label: 'Proud' },
  { emoji: '💡', label: 'Inspired' },
]

const WEATHERS = ['☀️ Sunny', '🌤 Partly Cloudy', '🌧 Rainy', '⛈ Stormy', '❄️ Cold', '🌙 Night', '🌈 After Rain', '🌫 Foggy']

const VOCAB_WORDS = [
  { word: 'Serendipity', meaning: 'Finding good things unexpectedly' },
  { word: 'Ephemeral', meaning: 'Lasting for only a short time' },
  { word: 'Resilient', meaning: 'Recovering quickly from difficulties' },
  { word: 'Melancholy', meaning: 'A deep, pensive sadness' },
  { word: 'Exhilarating', meaning: 'Making one feel very happy and excited' },
  { word: 'Cathartic', meaning: 'Providing relief through expression' },
  { word: 'Gratitude', meaning: 'The quality of being thankful' },
  { word: 'Profound', meaning: 'Very great or intense; deep meaning' },
  { word: 'Tranquil', meaning: 'Free from disturbance; calm' },
  { word: 'Nostalgic', meaning: 'A sentimental longing for the past' },
]

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchEntry, createEntry, updateEntry, deleteEntry, saving } = useEntryStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(MOODS[0])
  const [weather, setWeather] = useState(WEATHERS[0])
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [photos, setPhotos] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [vocabWords] = useState(() => [...VOCAB_WORDS].sort(() => 0.5 - Math.random()).slice(0, 6))
  const [hoveredVocab, setHoveredVocab] = useState(null)
  const [wordCount, setWordCount] = useState(0)
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  const [lastSaved, setLastSaved] = useState(null)

  const isEdit = !!id

  useEffect(() => {
    if (id) {
      fetchEntry(id).then(entry => {
        if (entry) {
          setTitle(entry.title)
          setContent(entry.content)
          setMood(entry.mood || MOODS[0])
          setWeather(entry.weather || WEATHERS[0])
          setTags(entry.tags || [])
          setPhotos(entry.photos || [])
          setIsFavorite(entry.isFavorite || false)
          setEntryDate(entry.entryDate?.split('T')[0] || new Date().toISOString().split('T')[0])
          setWordCount((entry.content || '').trim().split(/\s+/).filter(Boolean).length)
        }
      })
    }
  }, [id])

  // Word count
  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0)
  }, [content])

  // Auto-save
  useEffect(() => {
    if (!content.trim() || !title.trim()) return
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    const timer = setTimeout(() => {
      if (id) handleSave(true)
    }, 5000)
    setAutoSaveTimer(timer)
    return () => clearTimeout(timer)
  }, [content, title, mood, weather])

  const handleSave = async (isAuto = false) => {
    if (!title.trim()) { if (!isAuto) toast.error('Please add a title'); return }
    if (!content.trim()) { if (!isAuto) toast.error('Please write something'); return }

    const payload = { title, content, mood, weather, tags, photos, isFavorite, entryDate }
    const res = isEdit
      ? await updateEntry(id, payload)
      : await createEntry(payload)

    if (res.success) {
      setLastSaved(new Date())
      if (!isAuto) {
        toast.success(isEdit ? '✓ Entry updated!' : '✓ Entry saved!')
        if (!isEdit) navigate(`/entry/${res.entry._id}`)
      }
    } else {
      if (!isAuto) toast.error(res.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    const res = await deleteEntry(id)
    if (res.success) { toast.success('Entry deleted'); navigate('/') }
    else toast.error(res.message)
  }

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
      if (tag && !tags.includes(tag)) setTags([...tags, tag])
      setTagInput('')
    }
  }

  const insertVocab = (word) => {
    const ta = document.getElementById('entry-textarea')
    if (!ta) return
    const pos = ta.selectionStart || content.length
    setContent(content.substring(0, pos) + word + content.substring(pos))
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = pos + word.length }, 10)
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-ink-300 font-hand">
              Saved {format(lastSaved, 'h:mm a')}
            </span>
          )}
          {isEdit && (
            <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-rose-50 text-ink-300 hover:text-rose-500 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={() => setIsFavorite(s => !s)}
            className={`p-2 rounded-xl transition-colors ${isFavorite ? 'text-amber-500' : 'text-ink-300 hover:text-amber-400'}`}
          >
            <Star size={16} className={isFavorite ? 'fill-amber-400' : ''} />
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      {/* Mood selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-sm text-ink-400 self-center mr-1">How are you feeling?</span>
        {MOODS.map(m => (
          <button
            key={m.label}
            type="button"
            onClick={() => setMood(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
              mood.label === m.label
                ? 'bg-parchment-100 border-parchment-400 text-ink-800 shadow-sm scale-105'
                : 'border-parchment-200 text-ink-500 hover:bg-parchment-50'
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What's the title of today's entry..."
        className="w-full font-serif text-3xl text-ink-900 placeholder:text-ink-200
                   bg-transparent outline-none border-b-2 border-parchment-200
                   focus:border-parchment-500 pb-3 mb-4 transition-colors"
      />

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="date"
          value={entryDate}
          onChange={e => setEntryDate(e.target.value)}
          className="text-sm text-ink-500 border border-parchment-200 rounded-lg px-3 py-1.5 bg-white/60 outline-none focus:border-parchment-400"
        />
        <select
          value={weather}
          onChange={e => setWeather(e.target.value)}
          className="text-sm border border-parchment-200 rounded-lg px-3 py-1.5 bg-white/60 outline-none cursor-pointer focus:border-parchment-400 text-ink-600"
        >
          {WEATHERS.map(w => <option key={w}>{w}</option>)}
        </select>
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-parchment-100 text-ink-600 text-xs px-2.5 py-1 rounded-full">
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-rose-500 transition-colors ml-0.5">×</button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="+ add tag"
            className="text-xs border border-dashed border-parchment-300 rounded-full px-3 py-1 bg-transparent outline-none
                       focus:border-parchment-500 text-ink-500 w-24"
          />
        </div>
        <span className="text-xs text-ink-300 ml-auto">{wordCount} words</span>
      </div>

      {/* Paper writing area */}
      <div className="relative bg-white/90 rounded-2xl border border-parchment-200 shadow-md mb-6 overflow-hidden">
        {/* Notebook binding */}
        <div className="absolute left-0 top-0 bottom-0 w-12 border-r-2 border-parchment-400/40"
             style={{ background: 'linear-gradient(to right, #f0e4d0, transparent)', opacity: 0.5 }} />
        {/* Holes */}
        <div className="absolute left-3.5 top-0 bottom-0 flex flex-col justify-around py-10 pointer-events-none">
          {[0,1,2].map(i => (
            <div key={i} className="w-3.5 h-3.5 rounded-full bg-parchment-50 border-2 border-parchment-200" />
          ))}
        </div>

        <TextareaAutosize
          id="entry-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Start writing about your day... What happened? How did it make you feel? What are you grateful for? What made you smile today?"
          minRows={14}
          className="w-full bg-transparent outline-none resize-none
                     font-hand text-xl text-ink-800 leading-[2.2em]
                     pl-16 pr-8 py-8
                     placeholder:text-ink-200 placeholder:font-sans placeholder:text-base
                     lined-paper"
        />
      </div>

      {/* Photos */}
      <div className="mb-6">
        <h3 className="font-serif text-lg text-ink-700 mb-3 flex items-center gap-2">
          📸 Photos & Screenshots
          <span className="text-xs text-ink-400 font-sans font-normal">Add memories to this entry</span>
        </h3>
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </div>

      {/* Vocabulary chips */}
      <div className="mb-6">
        <h3 className="font-serif text-lg text-ink-700 mb-3">📖 Word Suggestions
          <span className="text-xs text-ink-400 font-sans font-normal ml-2">Click to insert into your entry</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {vocabWords.map(v => (
            <div key={v.word} className="relative">
              <button
                type="button"
                onClick={() => insertVocab(v.word)}
                onMouseEnter={() => setHoveredVocab(v.word)}
                onMouseLeave={() => setHoveredVocab(null)}
                className="px-4 py-2 bg-white border border-parchment-200 rounded-full text-sm text-ink-600
                           hover:bg-parchment-50 hover:border-parchment-400 hover:text-ink-800 transition-all"
              >
                {v.word}
              </button>
              {hoveredVocab === v.word && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-ink-900 text-white
                                text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-lg">
                  {v.meaning}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink-900" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Coach */}
      <AICoach
        content={content}
        title={title}
        entryId={id}
      />
    </div>
  )
}