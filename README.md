# 📖 My Journal — Full-Stack Diary App

A beautiful, AI-powered personal diary built with **React + Tailwind CSS + Node.js + MongoDB**.

---

## ✨ Features

- 🔐 **User Authentication** — JWT-based register/login
- ✍️ **Rich Diary Editor** — Notebook-style lined paper, mood selector, weather tags
- 📸 **Photo Uploads** — Attach photos & screenshots to every entry
- 🤖 **AI English Coach** — Grammar check, vocabulary, style analysis, writing prompts (Claude AI)
- 📊 **Progress Tracking** — Writing calendar heatmap, streak counter, achievements
- 🔍 **Search & Filter** — Full-text search, mood filter, favorites
- 📖 **Word Suggestions** — Daily vocabulary chips with meanings
- 🔥 **Streak Tracking** — Daily writing streak motivation
- 🌙 **Auto-save** — Entries auto-save every 5 seconds while editing

---

## 🗂️ Project Structure

```
diary-app/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (bcrypt password)
│   │   └── Entry.js         # Entry schema (wordCount, photos, AI analysis)
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── entries.js       # Full CRUD + stats + favorites
│   │   ├── ai.js            # Claude AI endpoints
│   │   └── upload.js        # Multer photo upload
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── uploads/             # Uploaded photos stored here
│   ├── server.js            # Express app entry
│   ├── .env.example         # Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx       # Sidebar + topbar shell
    │   │   ├── AICoach.jsx      # AI English coach panel
    │   │   └── PhotoUpload.jsx  # Photo grid + lightbox
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx  # Entry grid + filters
    │   │   ├── EditorPage.jsx     # Create/edit entry
    │   │   ├── EntryViewPage.jsx  # Read entry
    │   │   └── ProgressPage.jsx   # Stats + calendar
    │   ├── context/
    │   │   ├── authStore.js   # Zustand auth state
    │   │   └── entryStore.js  # Zustand entries state
    │   ├── utils/
    │   │   └── api.js         # Axios instance + interceptors
    │   ├── App.jsx            # Routes
    │   ├── main.jsx           # Entry point
    │   └── index.css          # Tailwind + custom styles
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- An Anthropic API key (for AI features)

### 2. Clone & Install

```bash
# Backend
cd diary-app/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
# backend/.env  (copy from .env.example)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/diary_app
JWT_SECRET=change_this_to_a_random_secret_string
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
CLIENT_URL=http://localhost:5173
```

### 4. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → App running on http://localhost:5173
```

### 5. Open in Browser
Visit **http://localhost:5173**, register an account, and start writing!

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Entries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/entries` | List entries (with filters & pagination) |
| GET | `/api/entries/stats` | Get writing statistics |
| GET | `/api/entries/:id` | Get single entry |
| POST | `/api/entries` | Create entry |
| PUT | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |
| PATCH | `/api/entries/:id/favorite` | Toggle favorite |

### AI Coach
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/grammar` | Grammar check |
| POST | `/api/ai/vocabulary` | Vocabulary suggestions |
| POST | `/api/ai/style` | Writing style analysis |
| POST | `/api/ai/translate` | Translation help (Sinhala/Tamil) |
| POST | `/api/ai/prompts` | Writing prompt generation |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/photo` | Upload single photo |
| POST | `/api/upload/photos` | Upload multiple photos |
| DELETE | `/api/upload/:filename` | Delete photo |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion |
| State | Zustand |
| Routing | React Router v6 |
| HTTP | Axios |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Claude (Anthropic API) |
| File Upload | Multer |
| Date handling | date-fns |

---

## 🌐 Production Deployment

### Backend (Railway / Render)
1. Set environment variables in the platform dashboard
2. Set `MONGODB_URI` to your Atlas connection string
3. Deploy the `backend/` folder

### Frontend (Vercel / Netlify)
1. Update `vite.config.js` proxy target to your backend URL
2. Or set `VITE_API_URL` env variable and update `src/utils/api.js`
3. Deploy the `frontend/` folder

---

## 📝 Tips for Writing Better English

The AI coach helps you:
1. **Grammar Check** — Fix mistakes automatically
2. **Vocabulary** — Replace simple words with expressive ones
3. **Style** — Make your writing more vivid and engaging
4. **Translate Help** — Turn Sinhala/Tamil phrases into natural English
5. **Writing Prompts** — Get deep questions to expand your entries

Write every day to build your streak and watch your English improve! 🌟
