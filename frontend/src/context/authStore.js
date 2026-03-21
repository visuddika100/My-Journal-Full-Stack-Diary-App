import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates }
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore