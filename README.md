# ☢️ Annotate Board Portal

A production-grade, full-stack radiology **task management** and **AI-powered image annotation** platform. Built with Django REST Framework (backend) and Next.js 16 (frontend), deployable to **Render** (backend) + **Vercel** (frontend) with zero cookie issues.

---

## ✨ Features

### 🗂️ Task Management (Kanban Board)

- **Drag-and-drop** Kanban board with three columns (To Do / In Progress / Done)
- **Date-filtered** tasks — navigate by day using the date selector
- **Live search** — filter tasks by title or tag in real-time
- **Stats bar** — at-a-glance counts (todo / in-progress / done) + completion percentage
- **Task priority** — Low / Medium / High with color-coded visual badges
- **Tags** — comma-separated, filterable
- **Voice dictation** — speak a task title via Web Speech API (Chrome/Edge)
- **Optimistic UI** — drag-and-drop updates the board instantly; rolls back on API error
- **Sync indicator** — shows Saving… / Synced / Offline state in real time
- **Link scans to tasks** — attach uploaded radiology images directly to a task card

### 🖼️ Image Annotation

- **Upload** medical images (any format: DICOM screenshots, PNGs, JPGs)
- **Polygon annotation** — click to place vertices, save multi-point shapes
- **AI Auto-Annotate** — run YOLOv8 segmentation with one click; detected regions are saved automatically
- **Image thumbnail strip** — scroll through all uploaded images with polygon count badges
- **Radiologist toolkit** — brightness slider + invert colors for better lesion visibility
- **Zoom & pan** — mouse-wheel zoom to exact point + click-drag panning (scale-aware)
- **Zoom indicator** — always-visible zoom % in the toolbar
- **Export YOLO format** — download annotation `.txt` files ready for model training
- **Keyboard shortcuts** — `Ctrl+Z` undo last point · `Esc` cancel drawing

### 🔐 Authentication

- **Login & Register** — both in one page via tab switcher
- **Token-based** — no cookies, no cross-origin issues between Vercel and Render
- **Server-side logout** — invalidates the auth token on the server (not just local storage)
- **Rate limiting** — 10 login attempts per minute (brute-force protection)
- **Auth guards** — `/tasks` and `/annotate` redirect to login if unauthenticated

### ⌨️ Command Palette (`Ctrl+K`)

- Navigate to Tasks or Annotate instantly
- Create a new task without touching the mouse
- Log out from anywhere in the app

---

## 🛠 Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Django 6 + DRF | Batteries-included ORM, built-in token auth, fast CRUD |
| AI | YOLOv8 (Ultralytics) | State-of-the-art segmentation, runs in one function call |
| Frontend | Next.js 16 + React 19 | App Router, server components, Turbopack |
| State | Zustand | Tiny footprint, selector-based subscriptions |
| Drag & Drop | @hello-pangea/dnd | Accessible, battle-tested Kanban DnD |
| Canvas | Konva / react-konva | GPU-accelerated canvas with layered rendering |
| Animations | Framer Motion | Spring physics for modal & board animations |
| Database (local) | SQLite | Zero config for local dev |
| Database (prod) | PostgreSQL via `dj-database-url` | Persistent, Render-native |
| Static files | WhiteNoise | Serves Django static files without a CDN |
| Deployment | Render + Vercel | `render.yaml` included, zero-config Vercel |

---

## 🏗 Architecture

```
vai-radiology-assessment/
├── backend/                # Django project settings, URLs, WSGI
├── tasks/                  # Task CRUD app (models, views, serializers, URLs)
├── annotations/            # Image upload + polygon annotation app
│   └── views.py            # YOLO auto-annotate action
├── frontend/
│   └── src/
│       ├── app/            # Next.js App Router pages
│       │   ├── page.tsx        # Login + Register (one page, tab switcher)
│       │   ├── tasks/          # Kanban board
│       │   └── annotate/       # Image annotation workspace
│       ├── components/
│       │   ├── layout/         # Navbar, CommandPalette
│       │   ├── tasks/          # Column, TaskCard, TaskModal, VoiceInput, DateSelector
│       │   └── annotate/       # DrawingCanvas (Konva)
│       ├── store/              # Zustand stores (auth, tasks, annotations)
│       └── lib/api.ts          # Axios client with token interceptors
├── render.yaml             # One-click Render deployment config
├── .env.example            # All required env vars documented
├── build.sh                # Render build script
└── requirements.txt        # Python dependencies
```

---

## 🚀 Running Locally

### Backend

```bash
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Create a superuser (or use /api/auth/register/ from the frontend)
python manage.py createsuperuser

# 5. Start the API server
python manage.py runserver
# → API available at http://localhost:8000/api/
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set environment variable
# .env.local already contains: NEXT_PUBLIC_API_URL=http://localhost:8000/api/

# 3. Start dev server
npm run dev
# → App available at http://localhost:3000
```

---

## 🌐 Deploying to Production

### Backend → Render

1. Push repo to GitHub
2. In Render Dashboard → **New** → **Blueprint** → select this repo
3. Render reads `render.yaml` and auto-creates the **web service** + **PostgreSQL** database
4. Set the `FRONTEND_URL` environment variable to your Vercel URL (e.g. `https://vai-radiology.vercel.app`)
5. First deploy: open Render Shell → `python manage.py createsuperuser`

### Frontend → Vercel

1. In Vercel Dashboard → **New Project** → import the `frontend/` directory
2. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/`
3. Deploy — zero additional config needed

> **No cookie issues:** The app uses `Authorization: Token <key>` headers (not cookies), so there are zero cross-origin cookie problems between Vercel and Render.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login/` | Returns auth token |
| `POST` | `/api/auth/register/` | Creates account, returns auth token |
| `POST` | `/api/auth/logout/` | Invalidates server-side token |
| `GET` | `/api/tasks/?due_date=YYYY-MM-DD` | List tasks for authenticated user |
| `POST` | `/api/tasks/` | Create task |
| `PATCH` | `/api/tasks/<id>/` | Update task (used for Kanban moves) |
| `DELETE` | `/api/tasks/<id>/` | Delete task |
| `GET` | `/api/annotations/images/` | List images with nested polygons |
| `POST` | `/api/annotations/images/` | Upload image (multipart/form-data) |
| `POST` | `/api/annotations/images/<id>/auto_annotate/` | Run YOLOv8 segmentation |
| `POST` | `/api/annotations/polygons/` | Save polygon annotation |
| `DELETE` | `/api/annotations/polygons/<id>/` | Delete polygon |

---

## 🔒 Security

- `SECRET_KEY` read from environment (never hardcoded)
- DRF throttling: `20 req/min` (anon), `200 req/min` (user), `10/min` (login)
- Exception handler returns generic errors in production (no stack traces leaked)
- All querysets filtered by authenticated user — data isolation guaranteed at ORM level
- CORS locked to exact frontend URL via `FRONTEND_URL` env var

---

## 📄 License

Distributed under the MIT License.
