const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: String,
  caption: String,
  filename: String
}, { _id: false });

const aiAnalysisSchema = new mongoose.Schema({
  grammar: { type: Object, default: null },
  vocabulary: { type: Object, default: null },
  style: { type: Object, default: null },
  analyzedAt: Date
}, { _id: false });

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content too long']
  },
  mood: {
    emoji: { type: String, default: '😊' },
    label: { type: String, default: 'Happy' }
  },
  weather: {
    type: String,
    default: '☀️ Sunny'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  photos: [photoSchema],
  wordCount: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  aiAnalysis: aiAnalysisSchema,
  entryDate: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Auto calculate word count before save
// ✅ New
entrySchema.pre('save', function () {
  if (this.isModified('content')) {
    this.wordCount = this.content.trim().split(/\s+/).filter(Boolean).length;
  }
});
// Text search index    
entrySchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Entry', entrySchema);