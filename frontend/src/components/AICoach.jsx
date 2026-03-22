import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle, AlertCircle, BookOpen, Lightbulb, ChevronDown } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'grammar', label: 'Grammar', icon: CheckCircle },
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
  { id: 'style', label: 'Style', icon: Sparkles },
  //{ id: 'translate', label: 'Translate Help', icon: Languages },
  { id: 'prompts', label: 'Writing Prompts', icon: Lightbulb },
]

function ScoreBar({ score }) {
  const color = score >= 80 ? 'bg-teal-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-serif text-3xl text-parchment-700 leading-none">{score}</span>
      <div className="flex-1">
        <div className="h-2 bg-parchment-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
        <p className="text-xs text-ink-400 mt-1">out of 100</p>
      </div>
    </div>
  )
}

function GrammarResult({ data }) {
  return (
    <div>
      {data.score !== undefined && <ScoreBar score={data.score} />}
      {data.overall && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-3 text-sm text-teal-800">
          💬 {data.overall}
        </div>
      )}
      {(data.positive || []).map((p, i) => (
        <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-3 mb-2 text-sm text-green-800">
          ✓ {p}
        </div>
      ))}
      {(data.corrections || []).length === 0 ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-800">
          🎉 No major grammar issues found! Great work!
        </div>
      ) : (data.corrections || []).map((c, i) => (
        <div key={i} className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-2 text-sm">
          <p className="text-rose-700">❌ <strong>"{c.original}"</strong></p>
          <p className="text-green-700 mt-1">✅ <strong>"{c.fixed}"</strong></p>
          <p className="text-ink-500 mt-1 text-xs">{c.explanation}</p>
        </div>
      ))}
    </div>
  )
}

function VocabResult({ data }) {
  return (
    <div>
      {data.level && (
        <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs px-3 py-1 rounded-full mb-3">
          Your level: <strong>{data.level}</strong>
        </div>
      )}
      {(data.suggestions || []).map((s, i) => (
        <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2 text-sm">
          <p className="text-ink-600">Instead of <span className="line-through text-ink-400">"{s.original}"</span>, try:</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {(s.alternatives || []).map(a => (
              <span key={a} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">{a}</span>
            ))}
          </div>
          {s.example && <p className="text-xs text-ink-400 mt-1.5 italic">"{s.example}"</p>}
        </div>
      ))}
      {(data.new_words || []).map((w, i) => (
        <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-2 text-sm">
          <p className="font-serif text-lg text-ink-800">{w.word}
            {w.pronunciation && <span className="font-sans text-xs text-ink-400 ml-2">{w.pronunciation}</span>}
          </p>
          <p className="text-ink-600 text-xs mt-0.5">{w.meaning}</p>
          {w.example && <p className="text-xs text-ink-400 mt-1 italic">"{w.example}"</p>}
        </div>
      ))}
      {data.tip && <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-3 text-sm text-ink-600">💡 {data.tip}</div>}
    </div>
  )
}

function StyleResult({ data }) {
  return (
    <div>
      {data.score !== undefined && <ScoreBar score={data.score} />}
      {data.style && (
        <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs px-3 py-1 rounded-full mb-3">
          Style: <strong className="capitalize">{data.style}</strong>
        </div>
      )}
      {(data.strengths || []).map((s, i) => (
        <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-3 mb-2 text-sm text-green-800">✨ {s}</div>
      ))}
      {(data.improvements || []).map((imp, i) => (
        <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-2 text-sm">
          <p className="text-amber-800 font-medium">{imp.issue}</p>
          <p className="text-ink-600 text-xs mt-1">{imp.tip}</p>
          {imp.example && <p className="text-xs text-parchment-700 mt-1.5 bg-white rounded-lg p-2 border border-parchment-100 italic">"{imp.example}"</p>}
        </div>
      ))}
      {data.encouragement && (
        <p className="text-center text-ink-500 italic text-sm mt-3 font-hand text-base">"{data.encouragement}"</p>
      )}
    </div>
  )
}

/*function TranslateResult({ data }) {
  return (
    <div>
      {(data.non_english || []).length === 0 && (data.improvements || []).length === 0 ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-800">
          🎉 Your entry is all in English — great job!
        </div>
      ) : null}
      {(data.non_english || []).map((n, i) => (
        <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2 text-sm">
          <p className="text-ink-500 text-xs">{n.language}</p>
          <p className="text-ink-800"><strong>"{n.phrase}"</strong> = "{n.translation}"</p>
          {n.natural && <p className="text-xs text-parchment-700 mt-1">More natural: <strong>"{n.natural}"</strong></p>}
        </div>
      ))}
      {(data.improvements || []).map((imp, i) => (
        <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-2 text-sm">
          <p className="line-through text-ink-400 text-xs">"{imp.original}"</p>
          <p className="text-green-700">✅ "{imp.natural}"</p>
          <p className="text-xs text-ink-400 mt-0.5">{imp.reason}</p>
        </div>
      ))}
      {data.phrase_of_day && (
        <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-3 text-sm mt-3">
          <p className="text-xs text-ink-400 mb-1">📌 Phrase of the day</p>
          <p className="text-ink-800"><strong>Sinhala: </strong>{data.phrase_of_day.sinhala}</p>
          <p className="text-ink-600 text-xs mt-0.5">English: {data.phrase_of_day.english}</p>
        </div>
      )}
      {data.encouragement && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800 mt-3">
          💬 {data.encouragement}
        </div>
      )}
    </div>
  )
}*/

function PromptsResult({ data }) {
  return (
    <div>
      {(data.prompts || []).map((p, i) => (
        <div key={i} className="bg-white border border-parchment-100 rounded-xl p-4 mb-3 shadow-sm">
          <p className="text-ink-800 text-sm font-medium">❓ {p.question}</p>
          <p className="text-xs text-ink-400 mt-1.5 flex items-center gap-1">
            <span className="bg-parchment-100 px-2 py-0.5 rounded-full">{p.category}</span>
            {p.category === 'emotions' ? '💛' : p.category === 'gratitude' ? '🙏' : p.category === 'future' ? '🌟' : '💭'}
          </p>
        </div>
      ))}
      {data.challenge && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-sm text-violet-800 mb-3">
          🎯 Tomorrow's challenge: {data.challenge}
        </div>
      )}
      {data.quote && (
        <blockquote className="border-l-4 border-parchment-400 pl-4 py-1">
          <p className="font-hand text-lg text-ink-600">"{data.quote.text}"</p>
          <p className="text-xs text-ink-400 mt-1">— {data.quote.author}</p>
        </blockquote>
      )}
      {data.affirmation && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm text-rose-700 mt-3 text-center font-hand text-base">
          🌸 {data.affirmation}
        </div>
      )}
    </div>
  )
}

export default function AICoach({ content, title, entryId, onSaveAnalysis }) {
  const [activeTab, setActiveTab] = useState('grammar')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({})
  const [open, setOpen] = useState(true)

  const runAnalysis = async () => {
    if (!content?.trim()) { toast.error('Write something first!'); return }
    setLoading(true)
    try {
      const endpoints = {
        grammar: '/ai/grammar',
        vocabulary: '/ai/vocabulary',
        style: '/ai/style',
        //translate: '/ai/translate',
        prompts: '/ai/prompts',
      }
      const { data } = await api.post(endpoints[activeTab], { content, title })
      const result = data.analysis || data.data || {}
      setResults(prev => ({ ...prev, [activeTab]: result }))
      if (entryId && onSaveAnalysis) {
        onSaveAnalysis({ [activeTab]: result })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed')
    }
    setLoading(false)
  }

  const renderResult = () => {
    const r = results[activeTab]
    if (!r) return null
    if (activeTab === 'grammar') return <GrammarResult data={r} />
    if (activeTab === 'vocabulary') return <VocabResult data={r} />
    if (activeTab === 'style') return <StyleResult data={r} />
    //if (activeTab === 'translate') return <TranslateResult data={r} />
    if (activeTab === 'prompts') return <PromptsResult data={r} />
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(s => !s)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles size={17} className="text-white" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-blue-900">AI English Coach</h3>
            <p className="text-xs text-blue-500">Powered by Claude</p>
          </div>
        </div>
        <ChevronDown size={18} className={`text-blue-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                      activeTab === id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-blue-200 text-blue-600 bg-white hover:bg-blue-50'
                    }`}
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>

              {/* Run button */}
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                           px-4 py-2 rounded-xl text-sm font-medium transition-all mb-4
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Analysing...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Analyse My Writing
                  </>
                )}
              </button>

              {/* Results */}
              <AnimatePresence mode="wait">
                {results[activeTab] && (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white/70 rounded-xl p-4"
                  >
                    {renderResult()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}