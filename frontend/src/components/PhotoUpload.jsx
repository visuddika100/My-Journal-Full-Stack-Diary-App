import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, ZoomIn, Upload } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function PhotoUpload({ photos = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const inputRef = useRef()

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('photos', f))
      const { data } = await api.post('/upload/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const newPhotos = data.files.map(f => ({ url: f.url, filename: f.filename, caption: '' }))
      onChange([...photos, ...newPhotos])
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded!`)
    } catch (err) {
      // Fallback: read locally for preview
      const localPhotos = await Promise.all(files.map(file => new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve({ url: e.target.result, filename: file.name, caption: '' })
        reader.readAsDataURL(file)
      })))
      onChange([...photos, ...localPhotos])
      toast.success('Photos added (local preview)')
    }
    setUploading(false)
    e.target.value = ''
  }

  const removePhoto = (idx) => {
    onChange(photos.filter((_, i) => i !== idx))
  }

  const updateCaption = (idx, caption) => {
    onChange(photos.map((p, i) => i === idx ? { ...p, caption } : p))
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Existing photos */}
        {photos.map((photo, idx) => (
          <motion.div
            key={photo.url}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-parchment-200 bg-parchment-50"
          >
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = ''; e.target.style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setLightbox(photo.url)}
                className="p-1.5 bg-white/90 rounded-lg text-ink-700"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="p-1.5 bg-white/90 rounded-lg text-rose-600"
              >
                <X size={14} />
              </button>
            </div>
            {/* Caption input */}
            <input
              type="text"
              value={photo.caption || ''}
              onChange={e => updateCaption(idx, e.target.value)}
              placeholder="Add caption..."
              className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1
                         placeholder:text-white/60 outline-none focus:bg-black/70 transition-all"
            />
          </motion.div>
        ))}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-[4/3] rounded-xl border-2 border-dashed border-parchment-300
                     hover:border-parchment-500 hover:bg-parchment-50 transition-all
                     flex flex-col items-center justify-center gap-2 text-ink-400
                     hover:text-ink-600 disabled:opacity-60"
        >
          {uploading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <>
              <Camera size={20} />
              <span className="text-xs font-medium">Add Photo</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightbox}
              alt="Photo preview"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}