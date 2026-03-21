const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'AI service error');
  return data.content?.[0]?.text || '';
}

function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());
  } catch {
    return null;
  }
}

// POST /api/ai/grammar
router.post('/grammar', async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });
  try {
    const text = await callClaude(
      'You are a friendly English teacher reviewing diary entries. Respond ONLY with valid JSON, no markdown.',
      `Analyze this diary entry for grammar and return ONLY this JSON structure:
{"score": 85, "overall": "encouraging 1-2 sentence comment", "corrections": [{"original": "error text", "fixed": "corrected text", "explanation": "short explanation", "type": "grammar|spelling|punctuation"}], "positive": ["what they did well"]}
Max 4 corrections. Be encouraging and supportive.
Entry: "${content.substring(0, 1000)}"`
    );
    const parsed = parseJSON(text);
    if (!parsed) return res.status(500).json({ success: false, message: 'Could not parse AI response' });
    res.json({ success: true, analysis: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/vocabulary
router.post('/vocabulary', async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });
  try {
    const text = await callClaude(
      'You are an English vocabulary coach. Respond ONLY with valid JSON.',
      `Analyze vocabulary and return ONLY this JSON:
{"suggestions": [{"original": "simple word from text", "alternatives": ["better1", "better2"], "example": "example sentence with alternative"}], "new_words": [{"word": "interesting word", "meaning": "definition", "pronunciation": "/prəˌnʌnsiˈeɪʃən/", "example": "example sentence"}], "level": "A2|B1|B2|C1", "tip": "one actionable English tip"}
Max 3 suggestions, 2 new words. Focus on natural, beautiful English.
Entry: "${content.substring(0, 1000)}"`
    );
    const parsed = parseJSON(text);
    if (!parsed) return res.status(500).json({ success: false, message: 'Could not parse AI response' });
    res.json({ success: true, analysis: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/style
router.post('/style', async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });
  try {
    const text = await callClaude(
      'You are a creative writing coach reviewing personal diaries. Respond ONLY with valid JSON.',
      `Analyze writing style and return ONLY this JSON:
{"score": 78, "style": "descriptive|narrative|reflective|analytical", "strengths": ["strength1", "strength2"], "improvements": [{"issue": "what to improve", "tip": "how to improve", "example": "rewritten example"}], "sentence_variety": "good|average|poor", "encouragement": "inspiring 1-sentence message"}
Entry: "${content.substring(0, 1000)}"`
    );
    const parsed = parseJSON(text);
    if (!parsed) return res.status(500).json({ success: false, message: 'Could not parse AI response' });
    res.json({ success: true, analysis: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/prompts
router.post('/prompts', async (req, res) => {
  const { content, title } = req.body;
  try {
    const text = await callClaude(
      'You are a thoughtful journal writing coach. Respond ONLY with valid JSON.',
      `Generate prompts to deepen this diary entry and return ONLY this JSON:
{"prompts": [{"question": "deep reflective question", "category": "emotions|memories|future|gratitude|learning"}, {"question": "another question", "category": "category"}, {"question": "third question", "category": "category"}], "challenge": "creative writing challenge for tomorrow", "quote": {"text": "inspiring quote about reflection/growth", "author": "author"}, "affirmation": "positive affirmation related to their day"}
Entry title: "${title || 'My diary'}"
Entry snippet: "${(content || '').substring(0, 400)}"`
    );
    const parsed = parseJSON(text);
    if (!parsed) return res.status(500).json({ success: false, message: 'Could not parse AI response' });
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/translate
router.post('/translate', async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });
  try {
    const text = await callClaude(
      'You are a bilingual English-Sinhala/Tamil language coach. Respond ONLY with valid JSON.',
      `Help translate and improve this diary entry written by a Sri Lankan English learner. Return ONLY this JSON:
{"non_english": [{"phrase": "non-English phrase found", "language": "Sinhala|Tamil|other", "translation": "English translation", "natural": "natural English way to say it"}], "improvements": [{"original": "awkward phrase", "natural": "more natural English version", "reason": "why this sounds more natural"}], "phrase_of_day": {"sinhala": "common Sinhala phrase", "english": "English translation", "usage": "example"}, "encouragement": "encouraging message in English"}
Entry: "${content.substring(0, 1000)}"`
    );
    const parsed = parseJSON(text);
    if (!parsed) return res.status(500).json({ success: false, message: 'Could not parse AI response' });
    res.json({ success: true, analysis: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
