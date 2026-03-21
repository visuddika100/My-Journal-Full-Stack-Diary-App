import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import useAuthStore from '../context/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const result = await register(form.name, form.email, form.password)
    if (result.success) {
      toast.success('Welcome! Your journal is ready ✨')
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-parchment-50 paper-texture flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-parchment-100 rounded-2xl mb-4 shadow-sm">
            <BookOpen size={28} className="text-parchment-700" />
          </div>
          <h1 className="font-serif text-4xl text-ink-900">My Journal</h1>
          <p className="text-ink-400 mt-2 text-sm">Begin your writing journey today</p>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-3xl border border-parchment-100 shadow-xl p-8">
          <h2 className="font-serif text-2xl text-ink-800 mb-6">Create your journal</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ink-600 mb-1.5 font-medium">Your Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="What should we call you?"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-ink-600 mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-ink-600 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="input-base pr-12"
                  required minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium mt-2 disabled:opacity-60"
            >
              {loading ? 'Creating your journal...' : 'Start Writing ✦'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-parchment-600 hover:text-parchment-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}