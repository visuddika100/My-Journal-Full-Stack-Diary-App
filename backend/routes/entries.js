const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// Update user streak helper
async function updateStreak(userId) {
  const user = await User.findById(userId);
  const today = new Date(); today.setHours(0,0,0,0);
  const lastWritten = user.lastWritten ? new Date(user.lastWritten) : null;
  if (lastWritten) lastWritten.setHours(0,0,0,0);

  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = user.streak || 0;
  if (!lastWritten || lastWritten < yesterday) newStreak = 1;
  else if (lastWritten.getTime() === yesterday.getTime()) newStreak += 1;
  // same day → keep streak

  await User.findByIdAndUpdate(userId, {
    streak: newStreak,
    lastWritten: new Date()
  });
  return newStreak;
}

// GET /api/entries — list with filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, mood, tag, favorite, startDate, endDate, sort = '-entryDate' } = req.query;
    const query = { user: req.user._id };

    if (search) query.$text = { $search: search };
    if (mood) query['mood.label'] = mood;
    if (tag) query.tags = tag;
    if (favorite === 'true') query.isFavorite = true;
    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate);
      if (endDate) query.entryDate.$lte = new Date(endDate);
    }

    const [entries, total] = await Promise.all([
      Entry.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-content -aiAnalysis')
        .lean(),
      Entry.countDocuments(query)
    ]);

    res.json({
      success: true,
      entries,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/entries/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const [totalDocs, wordData, moodData, monthData, user] = await Promise.all([
      Entry.countDocuments({ user: userId }),
      Entry.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$wordCount' }, avg: { $avg: '$wordCount' } } }]),
      Entry.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$mood.label', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 }
      ]),
      Entry.aggregate([
        { $match: { user: userId, entryDate: { $gte: new Date(Date.now() - 30*86400000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } }, count: { $sum: 1 }, words: { $sum: '$wordCount' } } },
        { $sort: { _id: 1 } }
      ]),
      User.findById(userId).select('streak totalWords')
    ]);

    res.json({
      success: true,
      stats: {
        totalEntries: totalDocs,
        totalWords: wordData[0]?.total || 0,
        avgWords: Math.round(wordData[0]?.avg || 0),
        streak: user?.streak || 0,
        topMoods: moodData,
        last30Days: monthData
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/entries/:id
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/entries
router.post('/', async (req, res) => {
  try {
    const { title, content, mood, weather, tags, photos, entryDate } = req.body;
    const entry = await Entry.create({
      user: req.user._id,
      title, content,
      mood: mood || { emoji: '😊', label: 'Happy' },
      weather, tags, photos,
      entryDate: entryDate ? new Date(entryDate) : new Date()
    });

    // Update streak + totalWords
    const [streak] = await Promise.all([
      updateStreak(req.user._id),
      User.findByIdAndUpdate(req.user._id, { $inc: { totalWords: entry.wordCount } })
    ]);

    res.status(201).json({ success: true, entry, streak });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/entries/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await Entry.findOne({ _id: req.params.id, user: req.user._id });
    if (!existing) return res.status(404).json({ success: false, message: 'Entry not found' });

    const oldWords = existing.wordCount;
    const { title, content, mood, weather, tags, photos, isFavorite, entryDate } = req.body;

    Object.assign(existing, {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(mood !== undefined && { mood }),
      ...(weather !== undefined && { weather }),
      ...(tags !== undefined && { tags }),
      ...(photos !== undefined && { photos }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(entryDate !== undefined && { entryDate: new Date(entryDate) })
    });

    await existing.save();
    const diff = existing.wordCount - oldWords;
    if (diff !== 0) await User.findByIdAndUpdate(req.user._id, { $inc: { totalWords: diff } });

    res.json({ success: true, entry: existing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/entries/:id
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalWords: -entry.wordCount } });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/entries/:id/favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    entry.isFavorite = !entry.isFavorite;
    await entry.save();
    res.json({ success: true, isFavorite: entry.isFavorite });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/entries/:id/ai
router.put('/:id/ai', async (req, res) => {
  try {
    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { aiAnalysis: { ...req.body, analyzedAt: new Date() } },
      { new: true }
    );
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;