import { create } from 'zustand'
import api from '../utils/api'

const useEntryStore = create((set, get) => ({
  entries: [],
  currentEntry: null,
  stats: null,
  loading: false,
  saving: false,
  pagination: { total: 0, page: 1, pages: 1 },
  filters: { search: '', mood: '', tag: '', favorite: false },

  fetchEntries: async (params = {}) => {
    set({ loading: true })
    try {
      const filters = get().filters
      const merged = { ...filters, ...params }
      // Remove empty values so they don't get sent as query params
      const clean = Object.fromEntries(
        Object.entries(merged).filter(([_, v]) => v !== '' && v !== false && v != null)
      )
      const { data } = await api.get('/entries', { params: clean })
      set({ entries: data.entries, pagination: data.pagination, loading: false })
    } catch (err) {
      set({ loading: false })
    }
  },

  fetchEntry: async (id) => {
    set({ loading: true })
    try {
      const { data } = await api.get(`/entries/${id}`)
      set({ currentEntry: data.entry, loading: false })
      return data.entry
    } catch (err) {
      set({ loading: false })
      return null
    }
  },

  createEntry: async (entryData) => {
    set({ saving: true })
    try {
      const { data } = await api.post('/entries', entryData)
      set(state => ({
        entries: [data.entry, ...state.entries],
        currentEntry: data.entry,
        saving: false
      }))
      return { success: true, entry: data.entry }
    } catch (err) {
      set({ saving: false })
      return { success: false, message: err.response?.data?.message || 'Failed to save' }
    }
  },

  updateEntry: async (id, entryData) => {
    set({ saving: true })
    try {
      const { data } = await api.put(`/entries/${id}`, entryData)
      set(state => ({
        entries: state.entries.map(e => e._id === id ? { ...e, ...data.entry } : e),
        currentEntry: data.entry,
        saving: false
      }))
      return { success: true, entry: data.entry }
    } catch (err) {
      set({ saving: false })
      return { success: false, message: err.response?.data?.message || 'Failed to update' }
    }
  },

  deleteEntry: async (id) => {
    try {
      await api.delete(`/entries/${id}`)
      set(state => ({
        entries: state.entries.filter(e => e._id !== id),
        currentEntry: state.currentEntry?._id === id ? null : state.currentEntry
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete' }
    }
  },

  toggleFavorite: async (id) => {
    try {
      const { data } = await api.patch(`/entries/${id}/favorite`)
      set(state => ({
        entries: state.entries.map(e => e._id === id ? { ...e, isFavorite: data.isFavorite } : e),
        currentEntry: state.currentEntry?._id === id
          ? { ...state.currentEntry, isFavorite: data.isFavorite }
          : state.currentEntry
      }))
    } catch (err) {
      console.error('Toggle favorite error:', err)
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/entries/stats')
      set({ stats: data.stats })
    } catch (err) {
      console.error('Stats error:', err)
    }
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  clearCurrentEntry: () => set({ currentEntry: null }),
}))

export default useEntryStore