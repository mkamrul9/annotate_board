# 🏥 Annotate Board — Complete Technical Documentation

> A production-grade, full-stack radiology task management and AI-powered image annotation platform.
> Backend: Django REST Framework → Render. Frontend: Next.js 16 → Vercel.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Technology Stack — What, Why & How](#3-technology-stack--what-why--how)
4. [Architecture Deep Dive](#4-architecture-deep-dive)
5. [Backend: Every File Explained](#5-backend-every-file-explained)
6. [Frontend: Every File Explained](#6-frontend-every-file-explained)
7. [All API Routes: Request → Response Flow](#7-all-api-routes-request--response-flow)
8. [Database Schema](#8-database-schema)
9. [Authentication System](#9-authentication-system)
10. [State Management (Frontend)](#10-state-management-frontend)
11. [The Drawing Canvas Under the Hood](#11-the-drawing-canvas-under-the-hood)
12. [What Django Does Automatically vs. What We Built Custom](#12-what-django-does-automatically-vs-what-we-built-custom)
13. [Deployment: Render + Vercel](#13-deployment-render--vercel)
14. [Running Locally](#14-running-locally)
15. [Pros & Cons Analysis](#15-pros--cons-analysis)
16. [What Can Be Improved](#16-what-can-be-improved)

---

## 1. Project Overview

This application serves two core domains that work together:

1. **Task Management** — A Kanban board where radiologists can create, manage, and track daily tasks organized by date. Tasks have priorities (Low/Medium/High), tags, a status (To Do / In Progress / Done), and can be linked directly to an uploaded scan.

2. **Image Annotation** — A canvas workspace where users upload radiology images (PNGs, JPGs, DICOM screenshots), manually draw polygon shapes over regions of interest, and optionally trigger an AI (YOLOv8) to automatically detect and annotate regions in a single click.

Both domains share a single authenticated user account. The backend exposes a pure JSON REST API. The frontend is a Single Page Application that consumes it.

---

## 2. Repository Structure

```
vai-radiology-assessment/           ← Project root
│
├── backend/                        ← Django project config (settings, main URLs, WSGI)
│   ├── settings.py                 ← All Django settings (env-aware, prod-ready)
│   ├── urls.py                     ← Root URL router + auth endpoints
│   ├── wsgi.py                     ← WSGI entry point (used by gunicorn on Render)
│   └── asgi.py                     ← ASGI entry point (for future async support)
│
├── tasks/                          ← "Tasks" Django app
│   ├── models.py                   ← Task database model
│   ├── serializers.py              ← Task JSON serializer (with image_url null-guard)
│   ├── views.py                    ← Task CRUD ViewSet
│   ├── urls.py                     ← Task URL routing via DRF Router
│   ├── admin.py                    ← Django Admin configuration
│   ├── apps.py                     ← App config (BigAutoField default)
│   └── migrations/                 ← Auto-generated database migration files
│
├── annotations/                    ← "Annotations" Django app
│   ├── models.py                   ← AnnotationImage + PolygonAnnotation models
│   ├── serializers.py              ← Nested serializer (image → polygons in one call)
│   ├── views.py                    ← Image CRUD + Polygon CRUD + YOLO auto-annotate
│   ├── urls.py                     ← Annotation URL routing via DRF Router
│   ├── admin.py                    ← Django Admin configuration
│   ├── apps.py                     ← App config
│   └── migrations/                 ← Auto-generated database migration files
│
├── media/                          ← Uploaded image files (git-ignored, runtime only)
│   └── annotations/YYYY/MM/DD/     ← Files organized by upload date automatically
│
├── frontend/                       ← Next.js 16 application
│   ├── next.config.ts              ← Image domains, remote patterns
│   ├── package.json                ← Node.js dependencies
│   └── src/
│       ├── app/                    ← Next.js App Router pages
│       │   ├── layout.tsx          ← Root layout (Navbar, Toaster, fonts)
│       │   ├── globals.css         ← Design system (CSS custom properties)
│       │   ├── page.tsx            ← Login + Register page (tab switcher)
│       │   ├── tasks/page.tsx      ← Kanban board page
│       │   └── annotate/page.tsx   ← Image annotation workspace page
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.tsx      ← Sticky frosted glass navbar
│       │   │   └── CommandPalette.tsx ← Ctrl+K global command menu
│       │   ├── tasks/
│       │   │   ├── Column.tsx      ← Kanban column (droppable container)
│       │   │   ├── TaskCard.tsx    ← Individual draggable task card
│       │   │   ├── TaskModal.tsx   ← Create/edit task dialog
│       │   │   ├── DateSelector.tsx ← Day navigation widget
│       │   │   └── VoiceInput.tsx  ← Web Speech API voice dictation
│       │   └── annotate/
│       │       └── DrawingCanvas.tsx ← Konva.js canvas with 3 layers
│       ├── store/                  ← Zustand global state stores
│       │   ├── useAuthStore.ts     ← Authentication state (token, login, logout)
│       │   ├── useTaskStore.ts     ← Task CRUD + optimistic updates + sync status
│       │   └── useAnnotationStore.ts ← Image CRUD + polygon CRUD + auto-annotate
│       └── lib/
│           └── api.ts              ← Axios client with token + 401 interceptors
│
├── manage.py                       ← Django management command entry point
├── requirements.txt                ← All Python dependencies (pinned)
├── build.sh                        ← Render build script (pip install, migrate, collectstatic)
├── render.yaml                     ← Render Blueprint: defines web service + PostgreSQL
├── .env.example                    ← Documents all required environment variables
├── .gitignore                      ← Excludes venv, db, media, .env, node_modules, .next
├── test_api.py                     ← Manual integration test script (run locally)
├── yolov8n-seg.pt                  ← YOLOv8 nano segmentation model weights (7MB)
└── README.md                       ← User-facing feature overview
```

---

## 3. Technology Stack — What, Why & How

### Backend

| Technology | Version | What it is | Why we chose it |
|---|---|---|---|
| **Python** | 3.11+ | The programming language | Django ecosystem is Python-native |
| **Django** | 6.0.6 | The web framework | Batteries-included ORM, admin panel, authentication, migrations |
| **Django REST Framework (DRF)** | 3.17.1 | REST API toolkit for Django | Serializers, ViewSets, Token Auth, Throttling — all in one |
| **django-cors-headers** | 4.9.0 | Handles CORS preflight requests | Allows the Next.js frontend (port 3000) to call Django (port 8000) |
| **WhiteNoise** | 6.12.0 | Serves static files without a CDN | Required on Render which has no built-in static file server |
| **dj-database-url** | 2.3.0 | Parses a `DATABASE_URL` string into a Django `DATABASES` dict | Standard Render/Heroku pattern for connecting PostgreSQL |
| **gunicorn** | 26.0.0 | Production WSGI server | Django's dev server (`runserver`) is single-threaded; gunicorn handles concurrent requests |
| **Ultralytics (YOLOv8)** | 8.4.89 | AI object detection + segmentation | One-call API: `model(image_path)` returns masks with polygon coordinates |
| **Pillow** | 12.3.0 | Image validation library | Django's `ImageField` requires Pillow to validate that uploaded files are real images |
| **SQLite / PostgreSQL** | — | Databases | SQLite (zero-config) locally; PostgreSQL (persistent, production-grade) on Render |

### Frontend

| Technology | Version | What it is | Why we chose it |
|---|---|---|---|
| **Next.js** | 16.2.10 | React framework with App Router | File-based routing, server components, Turbopack (fast builds), easy Vercel deployment |
| **React** | 19 | UI rendering library | Component model for building interactive UIs |
| **TypeScript** | 5 | Typed JavaScript | Catches bugs at compile time, provides autocomplete |
| **Zustand** | ~4 | State management library | Minimal boilerplate, no Provider wrappers needed, selector-based subscriptions |
| **Axios** | ~1 | HTTP client | Interceptor support for attaching tokens and handling 401 globally |
| **@hello-pangea/dnd** | — | Drag-and-drop library | Maintained fork of react-beautiful-dnd, accessible, battle-tested Kanban DnD |
| **Konva / react-konva** | — | HTML Canvas 2D abstraction | GPU-accelerated canvas rendering with React integration; layers for efficient re-renders |
| **use-image** | — | React hook for loading images into Konva | Handles the async image load state needed by Konva |
| **Framer Motion** | ~11 | Animation library | Spring physics for modal and board entrance animations |
| **sonner** | — | Toast notification library | Minimal, beautiful dark-themed toasts |
| **cmdk** | — | Command palette component | Headless, accessible command menu with fuzzy search |
| **date-fns** | ~3 | Date utility library | Lightweight (tree-shaken), functional API for date arithmetic |
| **lucide-react** | — | Icon library | Clean, consistent SVG icons |
| **Tailwind CSS** | v4 | Utility-first CSS framework | Rapid styling without leaving JSX |

---

## 4. Architecture Deep Dive

### The Modular Monolith Pattern

We deliberately chose a **Modular Monolith** over Microservices. Here is why:

**Pros of this choice for this project:**
- A single Python process handles everything — zero distributed tracing, no Kafka, no API gateways
- Django's ORM can perform `JOIN` queries across `tasks` and `annotations` tables in a single SQL call (the `Task` model holds a `ForeignKey` to `AnnotationImage`)
- Deploying one service to Render is far simpler than orchestrating two or more services

**How domain isolation is maintained:**
The two domains — `tasks/` and `annotations/` — are completely separate Django apps. They have their own `models.py`, `views.py`, `serializers.py`, and `urls.py`. The only intentional coupling point is the `ForeignKey` from `Task` to `AnnotationImage`, which is the business requirement (link a task to a scan).

### Request Lifecycle

```
Browser / Fetch Call
       │
       ▼
[Next.js Frontend — Vercel]
  api.ts (Axios client)
    - Attaches "Authorization: Token <key>" header
    - Watches for 401 → auto-logout
       │
       ▼ HTTPS
[Django Backend — Render / gunicorn]
  backend/urls.py (root router)
    - Matches URL prefix → delegates to app router
       │
       ▼
  tasks/urls.py or annotations/urls.py
    - DRF DefaultRouter maps HTTP method to ViewSet action
       │
       ▼
  ViewSet (e.g., TaskViewSet)
    1. TokenAuthentication verifies "Authorization" header
    2. IsAuthenticated permission check passes
    3. AnonRateThrottle / UserRateThrottle checks rate
    4. get_queryset() filters data to current user
    5. Serializer validates + transforms data
    6. Response returned as JSON
       │
       ▼
  JSON Response
       │
       ▼
[Zustand Store (Frontend)]
  - Updates in-memory state
  - React components re-render with new data
  - Toast notification shown to user
```

### Data Flow for Drag and Drop (Optimistic Update)

```
User drags TaskCard from "To Do" to "In Progress"
       │
       ▼
onDragEnd() fires in tasks/page.tsx
       │
       ▼
useTaskStore.moveTask(taskId, 'IN_PROGRESS')
  1. INSTANTLY: local state updated — board re-renders in <16ms
  2. BACKGROUND: PATCH /api/tasks/{id}/ is called
       │
       ├── SUCCESS: syncStatus = 'idle', toast "Task updated"
       └── FAILURE: originalTasks restored (rollback), toast "Failed to update"
```

---

## 5. Backend: Every File Explained

### `manage.py` (root)

Django's CLI entry point. You never edit this file. It sets `DJANGO_SETTINGS_MODULE` and passes commands to Django's management framework.

Commands used in this project:
- `python manage.py migrate` — apply database migrations
- `python manage.py createsuperuser` — create admin user
- `python manage.py collectstatic` — gather static files for WhiteNoise
- `python manage.py check` — validate settings (0 issues in production)

### `build.sh` (root)

Executed by Render on every deploy:
```bash
pip install -r requirements.txt  # Install all Python packages
python manage.py collectstatic --no-input  # Gather Django admin static files
python manage.py migrate  # Apply any pending DB migrations
```
The `set -o errexit` flag ensures the build fails fast on any error — Render won't deploy broken code.

### `render.yaml` (root)

Infrastructure-as-code for Render. Defines:
- A **web service** running `gunicorn backend.wsgi:application`
- A **PostgreSQL database** named `vai-radiology-db`
- Environment variable linking: `DATABASE_URL` is automatically injected from the linked DB
- `SECRET_KEY` is auto-generated by Render using `generateValue: true`

### `backend/settings.py`

The brain of Django. Key decisions made here:

| Setting | Value | Why |
|---|---|---|
| `SECRET_KEY` | From `os.environ` | Never hardcode secrets |
| `DEBUG` | `True` unless `RENDER` env var present | Auto-switches between dev and prod modes |
| `ALLOWED_HOSTS` | `localhost` + Render hostname | Django rejects requests from unrecognized hosts |
| `DATABASES` | SQLite locally, PostgreSQL on Render | `dj_database_url` parses `DATABASE_URL` automatically |
| `CORS_ALLOWED_ORIGINS` | localhost:3000 + `FRONTEND_URL` env var | Only your frontend can call the API |
| `DEFAULT_AUTHENTICATION_CLASSES` | `TokenAuthentication` | Token in `Authorization: Token xxx` header — no cookies |
| `DEFAULT_PERMISSION_CLASSES` | `IsAuthenticated` | Every endpoint requires login unless overridden |
| `DEFAULT_THROTTLE_RATES` | `anon: 20/min`, `user: 200/min` | Prevents abuse |
| `STATICFILES_STORAGE` | WhiteNoise Compressed Manifest | Serves `admin/` CSS/JS with content hashing |
| `MEDIA_ROOT` | `./media/` | Where uploaded images are saved on disk |

### `backend/urls.py`

The root URL router. Three custom things we built here:

**1. `LoginRateThrottle`**
A custom `AnonRateThrottle` subclass with a rate of `10/minute`. Applied to both `/login/` and `/register/` to prevent brute-force attacks.

**2. `register_view`**
Custom function-based view (not provided by Django/DRF). We wrote it because DRF's built-in auth views only handle login. It:
- Validates username is not empty and doesn't already exist
- Validates password is at least 8 characters
- Creates the user with `User.objects.create_user()` (which handles password hashing automatically)
- Immediately creates and returns an auth token (so the user is logged in after registering)

**3. `logout_view`**
Custom FBV. DRF has no built-in logout. It calls `request.user.auth_token.delete()` which physically removes the token row from the database. This is true **server-side logout** — the old token becomes invalid forever.

```python
urlpatterns = [
    path('admin/', ...),                            # Django Admin UI
    path('api/auth/login/', ...),                   # DRF built-in token login
    path('api/auth/register/', register_view, ...),  # Our custom register
    path('api/auth/logout/', logout_view, ...),      # Our custom server-side logout
    path('api/tasks/', include('tasks.urls')),        # Delegates to tasks app
    path('api/annotations/', include('annotations.urls')), # Delegates to annotations app
]
```

### `tasks/models.py`

Defines the `Task` database table. Key design decisions:

- **`TextChoices` enums** for `Status` and `Priority` — Django validates that only `'TODO'`, `'IN_PROGRESS'`, `'DONE'` are ever stored; invalid values are rejected at the ORM level
- **`JSONField` for `tags`** — stores an array like `["urgent", "ct-scan"]` directly in a single column, avoiding a slow Many-to-Many join table for simple string lists
- **`ForeignKey` to `AnnotationImage` with `SET_NULL`** — when an image is deleted, the task is not deleted; `annotation_image` just becomes `null`. This is the correct business logic: deleting a scan shouldn't erase the clinical task.
- **`auto_now_add` and `auto_now`** on timestamps — Django writes these automatically; no code needed

### `tasks/serializers.py`

The `TaskSerializer` translates between Python Task objects and JSON. Key custom code:

**`image_url` as `SerializerMethodField`**
We cannot use a simple `source='annotation_image.image.url'` because `annotation_image` can be `null` (tasks without scans). Accessing `.image.url` on a `None` object would crash with `AttributeError`. The `get_image_url` method safely checks for null at every level before building the absolute URL.

```python
def get_image_url(self, obj) -> str | None:
    if obj.annotation_image and obj.annotation_image.image:
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.annotation_image.image.url)
        return obj.annotation_image.image.url
    return None
```

`request.build_absolute_uri()` ensures the URL is absolute (e.g., `https://api.onrender.com/media/...`) not relative (`/media/...`). The frontend needs an absolute URL to load the image from across origins.

**`validate_title`**
Custom validator that strips whitespace and raises an error if the title becomes empty. Prevents tasks with titles like `"   "`.

### `tasks/views.py`

`TaskViewSet` inherits from `viewsets.ModelViewSet`, which gives us `list`, `create`, `retrieve`, `update`, `partial_update`, and `destroy` for free.

**Custom `get_queryset`:**
- `filter(user=self.request.user)` — absolute data isolation. User A can never see User B's tasks.
- `.select_related('annotation_image')` — a single SQL `LEFT JOIN` query. Without this, every task in a list would trigger a separate DB query for its linked image (the N+1 problem).
- `?due_date=YYYY-MM-DD` query parameter filtering — the Kanban board shows only today's tasks by default

**Custom `perform_create`:**
Injects `user=self.request.user` before saving, so the task is owned by whoever created it.

### `tasks/urls.py`

Uses DRF's `DefaultRouter` which auto-generates these URL patterns from `TaskViewSet`:

| URL | Method | ViewSet Action |
|---|---|---|
| `api/tasks/` | GET | `list` |
| `api/tasks/` | POST | `create` |
| `api/tasks/{id}/` | GET | `retrieve` |
| `api/tasks/{id}/` | PUT | `update` |
| `api/tasks/{id}/` | PATCH | `partial_update` |
| `api/tasks/{id}/` | DELETE | `destroy` |

### `annotations/models.py`

Two tables:

**`AnnotationImage`**
- `ImageField(upload_to='annotations/%Y/%m/%d/')` — Django + Pillow validates that the uploaded bytes are actually an image, then saves the file to `media/annotations/2026/07/09/filename.png` automatically
- `ForeignKey(User, on_delete=CASCADE)` — deleting a user deletes all their images

**`PolygonAnnotation`**
- `JSONField(default=list)` — stores coordinates as `[[0.12, 0.34], [0.56, 0.78], ...]`. These are **normalized** values between 0 and 1, not pixel values. This means the annotations are resolution-independent — the same data renders correctly whether the canvas is 800px or 1920px wide.
- `ForeignKey(AnnotationImage, on_delete=CASCADE)` — deleting an image deletes all its polygons

### `annotations/serializers.py`

**Nested serializer** — the `AnnotationImageSerializer` includes `PolygonAnnotationSerializer` as a nested field:

```python
polygons = PolygonAnnotationSerializer(many=True, read_only=True)
```

Result: a single `GET /api/annotations/images/` request returns the image AND all its polygons in one JSON response. The frontend never needs a second request to load annotations.

```json
{
  "id": 7,
  "image": "https://api.onrender.com/media/annotations/2026/07/09/scan.png",
  "uploaded_at": "2026-07-09T10:30:00Z",
  "polygons": [
    { "id": 12, "points": [[0.1, 0.2], [0.3, 0.4], [0.5, 0.2]], "created_at": "..." },
    { "id": 13, "points": [[0.6, 0.7], [0.8, 0.9], [0.7, 0.5]], "created_at": "..." }
  ]
}
```

### `annotations/views.py`

**`get_yolo_model()` — Lazy Singleton Pattern**

```python
_yolo_model = None

def get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        from ultralytics import YOLO
        model_path = os.environ.get('YOLO_MODEL_PATH', 'yolov8n-seg.pt')
        _yolo_model = YOLO(model_path)
    return _yolo_model
```

Why lazy? Loading YOLOv8 takes ~2-5 seconds and allocates ~150MB of RAM. If we loaded it at module import time (`_yolo_model = YOLO(...)`), every cold start of the Django process (including running `migrate`, `check`, etc.) would trigger this delay. By making it lazy, we only pay the cost the first time someone actually clicks "Auto-Annotate".

Why a global singleton? Because model loading is expensive. After the first load, all subsequent requests reuse the same model object from memory — sub-millisecond overhead.

**`AnnotationImageViewSet.auto_annotate()` — Custom DRF Action**

```python
@action(detail=True, methods=['post'])
def auto_annotate(self, request, pk=None):
```

`@action(detail=True)` tells DRF to register this as `POST /api/annotations/images/{id}/auto_annotate/`. The flow:

1. `self.get_object()` — fetches the `AnnotationImage` by `pk`, raises 404 if not found, validates the user owns it (via `get_queryset`)
2. Get the absolute file path from `annotation_image.image.path`
3. Load YOLO via the lazy singleton
4. Run `model(image_path)` — returns detection results
5. Check if `result.masks is None` (no objects detected) — return 200 with a message
6. Loop through `result.masks.xy` — each mask is a list of `(x, y)` pixel coordinates
7. **Normalize** by dividing by `img_width` and `img_height` — converts pixels to [0,1] fractions
8. Create `PolygonAnnotation` DB records
9. Return all new polygons serialized as JSON with status 201

**Error Handling Strategy:**
- `FileNotFoundError` → returns 404 (image file was deleted from disk separately)
- Any other `Exception` → returns 500. In `DEBUG=True`, returns the full traceback (useful for development). In production, returns only `"Auto-annotation failed. Please try again."` — we never leak internal error details.

**`PolygonAnnotationViewSet.perform_create()` — Security Check**

```python
image = get_object_or_404(AnnotationImage, id=image_id, user=self.request.user)
```

Before saving a polygon, we verify the image belongs to the requesting user. Without this check, a malicious user could POST `{"image": 999, "points": [...]}` with someone else's image ID and attach annotations to data they don't own. `get_object_or_404` returns a clean 404 response instead of crashing with `DoesNotExist`.

### `test_api.py` (root)

A manual integration test script (not Django's unittest framework). Runs against `http://localhost:8080/api` and tests the full CRUD lifecycle of tasks: create → read+filter → update → delete. Run with `python test_api.py` after starting the server.

---

## 6. Frontend: Every File Explained

### `frontend/next.config.ts`

Configures `next/image` remote patterns. Without this, Next.js blocks image loading from external domains (a security feature). We add both:
- `http://localhost:8000/media/**` — for local development
- The production Render backend hostname (parsed from `NEXT_PUBLIC_API_URL`) — for production

### `frontend/src/app/globals.css`

The design system. Not just reset CSS — this file contains:
- **CSS custom properties** (`--color-indigo-glow`, `--surface-bg`, etc.) — the single source of truth for the color palette
- **`.gradient-bg`** — a `background-position` keyframe animation that shifts a 5-stop gradient, creating the animated backdrop on the login page
- **`.glass-card`** — the glassmorphism effect using `backdrop-filter: blur(20px)` + semi-transparent background + indigo border
- **Custom scrollbars** — the thin dark scrollbar used throughout the app
- **Default transition** — `transition: all 0.15s ease` on all interactive elements

### `frontend/src/app/layout.tsx`

The root layout wraps every page. It:
- Loads the Geist fonts from Google Fonts and sets CSS variables for them
- Sets the `<title>` and `<meta>` description (SEO)
- Renders `<Navbar />` globally (the Navbar itself decides to hide on the login page)
- Renders `<Toaster />` globally (styled to match the dark theme)
- Renders `<CommandPalette />` globally (listens for `Ctrl+K` anywhere in the app)

### `frontend/src/app/page.tsx` — Login Page

This is the root route (`/`). It serves double duty as both login and registration via a tab switcher.

**Key behaviors:**
- On mount, checks `isAuthenticated` from `useAuthStore` and redirects to `/tasks` if already logged in (prevents seeing the login page when you're already in)
- `mode` state controls which form behavior is active (`'login'` or `'register'`)
- On submit: calls `POST /api/auth/login/` or `POST /api/auth/register/`, then calls `login(token)` to store the token and redirects to `/tasks`
- Password field has a show/hide toggle button
- Error messages animate in/out using `AnimatePresence` from Framer Motion
- Background has two decorative blurred div orbs using `radial-gradient` + `blur()`
- The card fades and slides up using a Framer Motion `initial/animate` variant

### `frontend/src/app/tasks/page.tsx` — Kanban Board

The main application page.

**Auth Guard:** `useEffect` checks `isAuthenticated` on mount and redirects to `/` if false. Also returns `null` to prevent flash-of-unauthenticated-content.

**`StatsBar` component (inline):** Counts tasks by status in real-time and shows a completion percentage bar. Uses `.filter()` on the in-memory task array — no API call needed.

**Live Search:** `useMemo` computes `filteredTasks` from `tasks` and `searchQuery`. Because it's memoized, filtering is only recalculated when either the task list or the search query actually changes — not on every render.

**Skeleton loading:** When `loading === true`, two `TaskSkeleton` components are shown in each column — these are `animate-pulse` grey boxes that mimic the shape of a real task card.

**`SyncIndicator`:** Shows `Cloud` (idle), `RefreshCw` spinning (syncing), or `CloudOff` (error) based on `useTaskStore`'s `syncStatus` state.

### `frontend/src/app/annotate/page.tsx` — Annotation Workspace

**Auth Guard:** Same pattern as the tasks page.

**`ThumbnailStrip`:** Renders a horizontal scrollable row of small 64×64 image previews. The active image has an indigo border. Each thumbnail shows a badge with the polygon count. Uses `<img>` (not `next/image`) for thumbnails since they're dynamic internal URLs and don't benefit from Next.js optimization at 64px.

**`fetchImages` on mount:** Always fetches — even if `images.length > 0` — to ensure the latest data is shown (e.g., if auto-annotate ran and the user navigated away).

**Deep-linking via `?imageId=N`:** The URL parameter `imageId` lets the Kanban board's "Annotate" button link directly to a specific image. The page reads `useSearchParams()` and finds the index of that image in the loaded array, then calls `setCurrentIndex(index)`.

**YOLO export:** The "Export YOLO" button generates a `.txt` file in YOLO segmentation format (`0 x1 y1 x2 y2 ...`) from the current image's polygons and triggers a browser download. All computed client-side, no API call.

**Uploading vs. Loading states:** `uploading` is set during file upload; `loading` is set during AI annotation or image fetching. These are separate so the "Upload" button can show a spinner while the "Auto-Annotate" button can simultaneously show its own spinner.

### `frontend/src/components/layout/Navbar.tsx`

Sticky `position: sticky; top: 0` with `backdrop-filter: blur` for the frosted glass effect.

- Reads `isAuthenticated` from `useAuthStore` — returns `null` (renders nothing) when the user is logged out. This is why the navbar doesn't appear on the login page without any route-matching logic.
- `pathname.startsWith(href)` for active detection — handles nested routes correctly (e.g., `/annotate/123` still highlights "Annotate")
- Logout calls `POST /api/auth/logout/` first (server-side token deletion), then `logout()` locally (clear localStorage), then navigates to `/`. The `try/catch/finally` ensures local logout always happens even if the server request fails.

### `frontend/src/components/layout/CommandPalette.tsx`

Opens on `Ctrl+K` (or `Cmd+K` on Mac). Uses the headless `cmdk` library for keyboard navigation.

- Global `keydown` listener is registered and cleaned up with a `useEffect`
- Clicking the backdrop (`div.onClick`) closes the palette
- "Create New Task" programmatically clicks the `#new-task-btn` button on the tasks page via `document.getElementById`
- Only shows "Log Out" and "Create New Task" options when `isAuthenticated === true`

### `frontend/src/components/tasks/Column.tsx`

A `Droppable` container from `@hello-pangea/dnd`. Each column has:
- A color-coded accent system (`COLUMN_ACCENTS` object) — grey for To Do, yellow for In Progress, green for Done
- When `snapshot.isDraggingOver === true` (a card is being dragged over it), the background turns indigo with a dashed border to provide visual affordance
- Empty state: an `Inbox` icon with "No tasks here" text (animated with Framer Motion)

### `frontend/src/components/tasks/TaskCard.tsx`

A `Draggable` from `@hello-pangea/dnd`. Wrapped in `React.memo` to prevent unnecessary re-renders when sibling tasks change.

Key features:
- `PRIORITY_STYLES` const — extracted outside the component to prevent object re-creation on every render
- `snapshot.isDragging` applies `scale-[1.02] rotate-1` CSS transforms for a satisfying "picked up" visual effect
- `e.stopPropagation()` on the image section — prevents clicking "Annotate" from also triggering the card's `onClick` (which would open the edit modal)
- Uses `next/image` with `fill` + `sizes="32px"` for the scan thumbnail — Next.js serves an optimized, correct-size version

### `frontend/src/components/tasks/TaskModal.tsx`

Dialog for creating and editing tasks. Key behaviors:

- `AnimatePresence` + `motion.div` gives a spring-physics open/close animation
- Priority is a **3-button toggle** (not a dropdown), each button color-coded to match the task card priority badge
- On create: calls `addTask` which POSTs and then re-fetches (to get the server-assigned ID)
- On update: optimistic update via `updateTask` — the modal closes immediately and changes appear instantly
- Delete requires a `window.confirm()` dialog — a simple but important safeguard against accidental deletion
- `fetchImages` is called when the modal opens if no images are loaded yet — populates the scan dropdown lazily

### `frontend/src/components/tasks/DateSelector.tsx`

Uses `date-fns` for date arithmetic:
- `subDays(parseISO(selectedDate), 1)` — go back one day
- `addDays(parseISO(selectedDate), 1)` — go forward one day
- Calling `setSelectedDate` in `useTaskStore` automatically triggers `fetchTasks()` for the new date

### `frontend/src/components/tasks/VoiceInput.tsx`

Uses the browser's `SpeechRecognition` API (Chrome/Edge only). Implementation notes:
- The button only renders after the component confirms `SpeechRecognition` exists in the browser (`isSupported` flag). On Firefox or Safari, this component renders nothing.
- The recognition object is created once in `useEffect` and stored in `useRef` — this avoids recreating it on every render
- `try/catch` around `.start()` prevents the error thrown if `.start()` is called while the recognizer is already running
- On result: creates a task with `priority: 'HIGH'` and `tags: ['voice-generated']` automatically

### `frontend/src/components/annotate/DrawingCanvas.tsx`

The most complex component. It uses **react-konva** to render a hardware-accelerated 2D canvas with **3 separate layers**:

**Layer 1 — Image Layer** (`listening={false}`)
Renders the uploaded image. `listening=false` tells Konva not to register this layer for mouse events — only the Stage handles click coordinates. The image has Konva filter support:
- `Konva.Filters.Brighten` — adjustable `-100%` to `+100%`
- `Konva.Filters.Invert` — flips all pixel values for viewing dark scans on light backgrounds

The `imageNodeRef.cache()` call is required before Konva filters take effect. It is only re-run when `img`, `brightness`, or `invert` change — not on every zoom/pan.

**Layer 2 — Annotations Layer** (default: listening=true)
Renders saved `PolygonAnnotation` records as closed `<Line>` elements with:
- `fill="rgba(99, 102, 241, 0.25)"` — semi-transparent indigo fill
- `stroke="#6366f1"` — solid indigo border
- `strokeWidth={2 / scale}` — the stroke width is divided by the current zoom scale so polygons don't appear thicker when zoomed in
- `onContextMenu` — right-click on a polygon triggers a delete confirmation

**Layer 3 — Active Drawing Layer** (`listening={false}`)
Renders the in-progress polygon being drawn:
- A dashed `<Line>` connecting all points placed so far
- A `<Circle>` at each point (green with white stroke) to show where points were placed

**Coordinate Normalization**
When the user clicks, the canvas converts pixel coordinates to normalized fractions:
```
normalizedX = (clickX - stageOffsetX) / scale / canvasWidth
normalizedY = (clickY - stageOffsetY) / scale / canvasHeight
```
These fractions (0.0 to 1.0) are stored in the database. When rendering, they are denormalized:
```
pixelX = normalizedX * canvasWidth
pixelY = normalizedY * canvasHeight
```
This means annotations render identically at any canvas size or screen resolution.

**ResizeObserver** watches the container `<div>` and updates the canvas dimensions whenever it changes (e.g., sidebar opens, window resizes). This gives correct behavior even for layout-triggered resizes, not just window resizes.

**Keyboard shortcuts:**
- `Ctrl+Z` / `Cmd+Z` — removes the last point from the active polygon
- `Escape` — cancels the current polygon entirely

### `frontend/src/lib/api.ts`

A pre-configured Axios instance. Two interceptors:

**Request interceptor:** Reads the token from `useAuthStore.getState().token` (direct store access, not a hook — so it works outside React components) and adds `Authorization: Token <key>` to every request header.

**Response interceptor:** If any API call returns `401 Unauthorized`:
1. Calls `useAuthStore.getState().logout()` — clears localStorage and Zustand state
2. Redirects to `/` (guarded by `typeof window !== 'undefined'` to prevent crash during SSR on Vercel)

This means the user is automatically logged out on any 401 — expired tokens, deleted accounts, etc.

### Zustand Stores

**`useAuthStore`**
- Persists to `localStorage` using `localStorage.getItem('token')` in the initial state
- The `typeof window !== 'undefined'` guard prevents crashes during Next.js SSR (where `window` doesn't exist)
- `login(token)` → saves to localStorage + updates state
- `logout()` → removes from localStorage + clears state

**`useTaskStore`**
- `selectedDate` initialized to today using `format(new Date(), 'yyyy-MM-dd')` from `date-fns`
- `moveTask`, `updateTask`, `deleteTask` all use the **optimistic update pattern**: update state immediately, then call the API in the background, rollback if the API fails
- `syncStatus` ('idle' | 'syncing' | 'error') drives the sync indicator in the Navbar area

**`useAnnotationStore`**
- Separate `loading` (for YOLO inference + fetching) and `uploading` (for file upload) states so both operations can show independent spinners
- `deletePolygon` uses optimistic update with rollback
- `uploadImage` prepends the new image to the array and sets `currentIndex: 0` so the freshly uploaded image is immediately active

---

## 7. All API Routes: Request → Response Flow

### `POST /api/auth/login/`

**Purpose:** Exchange credentials for a token.

**Flow:**
```
Request: { "username": "dr.smith", "password": "secret123" }
  │
  ▼
obtain_auth_token (DRF built-in)
  → Query User table: SELECT * WHERE username='dr.smith'
  → Verify password hash with Django's PBKDF2-SHA256
  → Query or create Token table entry for this user
  │
  ▼
Response 200: { "token": "abc123..." }
Response 400: { "non_field_errors": ["Unable to log in with provided credentials."] }
```

**What Django does automatically:** Password hashing verification (`check_password`), Token model management (`Token.objects.get_or_create`).

### `POST /api/auth/register/`

**Purpose:** Create a new user account and return a token.

**Flow:**
```
Request: { "username": "new_doctor", "password": "securepass" }
  │
  ▼
register_view (our custom code)
  → Validate: username and password not empty
  → Validate: password length >= 8
  → Check: User.objects.filter(username=...).exists()
  → User.objects.create_user(username, password)  ← Django hashes password automatically
  → Token.objects.get_or_create(user=user)
  │
  ▼
Response 201: { "token": "xyz789...", "username": "new_doctor" }
Response 400: { "error": "A user with that username already exists." }
```

### `POST /api/auth/logout/`

**Purpose:** Permanently invalidate the current token.

**Flow:**
```
Request: Authorization: Token abc123...
  │
  ▼
logout_view (our custom code)
  → TokenAuthentication verifies the token
  → request.user.auth_token.delete()  ← Deletes the row from authtoken_token table
  │
  ▼
Response 200: { "detail": "Successfully logged out." }
Response 401: { "detail": "Authentication credentials were not provided." }
```

### `GET /api/tasks/?due_date=2026-07-09`

**Purpose:** Fetch all tasks for today (or a given date).

**Flow:**
```
Request: Authorization: Token abc123...
  │
  ▼
TaskViewSet.list()
  → get_queryset():
      SELECT tasks JOIN annotation_images
      WHERE user_id = <authenticated_user_id>
        AND due_date = '2026-07-09'
  → TaskSerializer(queryset, many=True, context={'request': request})
    → For each task: build_absolute_uri() for image_url
  │
  ▼
Response 200: [
  {
    "id": 42,
    "title": "Review MRI Scan",
    "priority": "HIGH",
    "status": "TODO",
    "due_date": "2026-07-09",
    "tags": ["urgent", "neurology"],
    "annotation_image": 7,
    "image_url": "https://api.onrender.com/media/annotations/2026/07/09/scan.png",
    "created_at": "2026-07-09T08:00:00Z"
  },
  ...
]
```

### `POST /api/tasks/`

```
Request: { "title": "New Task", "priority": "HIGH", "status": "TODO", "due_date": "2026-07-09", "tags": ["ct-scan"] }
  │
  ▼
TaskViewSet.create()
  → Deserialize and validate (validate_title strips whitespace)
  → perform_create(): serializer.save(user=request.user)
  │
  ▼
Response 201: { "id": 43, "title": "New Task", ... }
Response 400: { "title": ["Task title cannot be empty."] }
```

### `PATCH /api/tasks/{id}/`

Used for both Kanban drag-drop (status change) and full task edits.

```
Request: { "status": "IN_PROGRESS" }
  │
  ▼
TaskViewSet.partial_update()
  → get_queryset() filters to user's tasks (prevents patching other users' tasks)
  → UPDATE tasks SET status='IN_PROGRESS' WHERE id=43 AND user_id=<me>
  │
  ▼
Response 200: { "id": 43, "status": "IN_PROGRESS", ... }
Response 404: {} (if the task doesn't belong to you)
```

### `DELETE /api/tasks/{id}/`

```
Response 204: (no content)
```

### `GET /api/annotations/images/`

```
Response 200: [
  {
    "id": 7,
    "image": "https://api.onrender.com/media/annotations/2026/07/09/scan.png",
    "uploaded_at": "2026-07-09T10:00:00Z",
    "polygons": [
      { "id": 12, "points": [[0.1, 0.2], [0.3, 0.4]], "created_at": "..." }
    ]
  }
]
```

**Single query thanks to `prefetch_related`:** `SELECT * FROM annotation_images WHERE user_id=<me>` + `SELECT * FROM polygon_annotations WHERE image_id IN (...)` — two queries total, not N+1.

### `POST /api/annotations/images/`

Multipart form-data upload:

```
Request: Content-Type: multipart/form-data; boundary=...
         image: <binary file data>
  │
  ▼
AnnotationImageViewSet.create()
  → ImageField validates it's a real image via Pillow
  → File saved to media/annotations/2026/07/09/filename.png
  → DB record created with user and file path
  │
  ▼
Response 201: { "id": 8, "image": "https://...", "polygons": [], "uploaded_at": "..." }
```

### `POST /api/annotations/images/{id}/auto_annotate/`

```
Request: (no body needed)
  │
  ▼
auto_annotate()
  → self.get_object() → verifies image belongs to user
  → get_yolo_model() → load YOLO singleton if not already loaded
  → model(image_path) → YOLO runs inference (~200-800ms)
  → Normalize pixel coords → store as PolygonAnnotation records
  │
  ▼
Response 201: [
  { "id": 15, "points": [[0.12, 0.34], [0.56, 0.78], ...], "created_at": "..." },
  { "id": 16, "points": [[0.23, 0.45], ...], "created_at": "..." }
]
Response 200: { "message": "No objects detected in this image." }
Response 404: { "error": "Image file not found on disk." }
Response 500: { "error": "Auto-annotation failed. Please try again." }
```

### `POST /api/annotations/polygons/`

```
Request: { "image": 7, "points": [[0.1, 0.2], [0.3, 0.4], [0.5, 0.3]] }
  │
  ▼
perform_create()
  → get_object_or_404(AnnotationImage, id=7, user=request.user)
  → PolygonAnnotation.objects.create(image=image, points=[[...]])
  │
  ▼
Response 201: { "id": 17, "points": [[0.1, 0.2], ...], "created_at": "..." }
Response 404: {} (if image ID doesn't belong to you)
```

### `DELETE /api/annotations/polygons/{id}/`

```
Response 204: (no content)
```

---

## 8. Database Schema

```
┌──────────────────────────────────┐
│ auth_user (Django built-in)      │
├──────────────────────────────────┤
│ id         BigInt PK             │
│ username   VARCHAR(150) UNIQUE   │
│ password   VARCHAR(128)          │  ← PBKDF2-SHA256 hash
│ ...        (other Django fields) │
└──────────────┬───────────────────┘
               │ 1
               │
    ┌──────────┴──────────┐
    │                     │
    │ (FK, CASCADE)        │ (FK, CASCADE)
    ▼ N                   ▼ N
┌─────────────────┐  ┌──────────────────────────────┐
│ tasks_task      │  │ annotations_annotationimage   │
├─────────────────┤  ├──────────────────────────────┤
│ id              │  │ id                            │
│ user_id (FK)    │  │ user_id (FK)                  │
│ title           │  │ image    VARCHAR (file path)  │
│ priority        │  │ uploaded_at DATETIME          │
│ status          │  └──────────────┬────────────────┘
│ due_date        │                 │ 1
│ tags    JSON    │                 │
│ annotation_     │                 │ (FK, CASCADE)
│   image_id (FK) │◄────────────────┤ N
│   (SET_NULL)    │  ┌──────────────▼────────────────┐
│ created_at      │  │ annotations_polygonannotation  │
│ updated_at      │  ├──────────────────────────────┤
└─────────────────┘  │ id                            │
                     │ image_id (FK)                 │
                     │ points   JSON                 │
                     │ created_at DATETIME           │
                     └───────────────────────────────┘

┌──────────────────────────┐
│ authtoken_token          │  ← DRF built-in
├──────────────────────────┤
│ key      VARCHAR(40) PK  │
│ user_id  (FK, 1-to-1)    │
│ created  DATETIME        │
└──────────────────────────┘
```

---

## 9. Authentication System

We use **DRF Token Authentication** (not session cookies or JWT). Here is why this matters for deployment:

| Mechanism | Cookie-Based | Token-Based (our choice) |
|---|---|---|
| Storage | Browser cookie (automatic) | `localStorage` (manual) |
| Cross-origin | Requires `SameSite=None; Secure` + complex CORS headers | Zero cross-origin issues — just a header |
| Logout | Must invalidate server session | Must delete the token row from DB |
| Vercel + Render | Cookie sharing across domains is blocked by browsers | Works perfectly across any two domains |

**Token lifecycle:**
1. User logs in → Django creates a `Token` row (`authtoken_token` table) with a random 40-char key
2. Frontend stores the key in `localStorage`
3. Every request attaches `Authorization: Token <key>`
4. Django's `TokenAuthentication` queries `SELECT * FROM authtoken_token WHERE key=...` to identify the user
5. User logs out → `request.user.auth_token.delete()` removes the row
6. Old token is now invalid — even if someone stole the key from localStorage, the server rejects it

---

## 10. State Management (Frontend)

We use **Zustand** — a minimal (1.7KB gzipped) state management library. The three stores are completely independent and communicate only through the shared `api` module.

```
useAuthStore          useTaskStore           useAnnotationStore
─────────────         ─────────────          ──────────────────
token                 tasks[]                images[]
isAuthenticated       selectedDate           currentIndex
login()               loading                loading
logout()              syncStatus             uploading
                      fetchTasks()           fetchImages()
                      moveTask()             uploadImage()
                      addTask()              savePolygon()
                      updateTask()           deletePolygon()
                      deleteTask()           autoAnnotate()
```

**Why Zustand over Redux:**
- No boilerplate (no `actions`, `reducers`, `dispatch`, `Provider`)
- Direct access outside React components via `useAuthStore.getState()` (used in `api.ts`)
- TypeScript-native interface definitions

**The Optimistic Update Pattern (used throughout):**
```typescript
const originalTasks = get().tasks;            // 1. Save current state
set({ tasks: updatedOptimistically });        // 2. Update UI immediately
try {
  await api.patch(...)                        // 3. Try the API call
  set({ syncStatus: 'idle' });               // 4a. Success
} catch {
  set({ tasks: originalTasks });             // 4b. Failure: restore original
}
```

---

## 11. The Drawing Canvas Under the Hood

### Why Konva instead of native `<canvas>`?

Native Canvas API requires imperative, pixel-by-pixel drawing commands. Konva provides:
- A React-style declarative API (`<Layer>`, `<Line>`, `<Circle>`)
- Layer-based rendering — only changed layers are redrawn, not the entire canvas
- Built-in event handling (click, wheel, context menu) with proper coordinate mapping
- Image filter pipeline (Brighten, Invert) without writing WebGL shaders

### The Three-Layer Architecture

```
Stage (the entire canvas element)
  ├── Layer 1: Image (listening=false, never re-renders unless filter changes)
  ├── Layer 2: Saved Polygons (re-renders when DB annotations change)
  └── Layer 3: Active Drawing (re-renders on every click; isolated from Layers 1&2)
```

By isolating the in-progress drawing to Layer 3, clicking to add a new point only causes Layer 3 to re-render. Layers 1 and 2 remain unchanged — critical for performance when rendering large images.

### Zoom Implementation

Mouse wheel zoom zooms toward the mouse cursor (not the center) using this formula:
```
mousePointTo = (pointer - stage.position) / currentScale
newPosition = pointer - mousePointTo * newScale
```
This keeps the image point under the cursor fixed while everything else zooms.

### Coordinate Normalization

Pixels → normalized (save to DB):
```
normalizedX = (clickX - stageX) / scale / canvasWidth
```

Normalized → pixels (render from DB):
```
pixelX = normalizedX * canvasWidth
```

This makes annotations **resolution-independent** — they render correctly at any canvas size.

---

## 12. What Django Does Automatically vs. What We Built Custom

### Django Does Automatically

| Feature | How |
|---|---|
| Password hashing | `User.objects.create_user()` uses PBKDF2-SHA256 + salt |
| Admin panel UI | `admin.site.register()` — full CRUD UI at `/admin/` |
| Database migrations | `makemigrations` + `migrate` translates models to SQL |
| File upload validation | `ImageField` + Pillow verifies image bytes before saving |
| File storage routing | `upload_to='annotations/%Y/%m/%d/'` auto-organizes files |
| Password validation | `AUTH_PASSWORD_VALIDATORS` in settings |
| CSRF protection | `CsrfViewMiddleware` (not used by our API but active for admin) |
| CORS headers | `django-cors-headers` middleware handles preflight OPTIONS |
| Static file serving | WhiteNoise middleware with compression and content-hashing |
| Query filtering | `get_queryset()` with `.filter()` |
| Serialization/deserialization | DRF `ModelSerializer` handles JSON ↔ Python object conversion |
| HTTP method routing | DRF `DefaultRouter` generates all CRUD URLs from a ViewSet |

### We Built Custom

| Feature | Where |
|---|---|
| Self-service registration endpoint | `backend/urls.py: register_view` |
| Server-side token logout | `backend/urls.py: logout_view` |
| Custom login rate throttle (10/min) | `backend/urls.py: LoginRateThrottle` |
| Null-safe image URL serialization | `tasks/serializers.py: get_image_url()` |
| Data isolation per user | `get_queryset()` in every ViewSet |
| N+1 query elimination | `select_related` + `prefetch_related` in ViewSets |
| YOLO lazy singleton | `annotations/views.py: get_yolo_model()` |
| Pixel-to-normalized coordinate conversion | `annotations/views.py: auto_annotate()` |
| Ownership validation before saving polygons | `annotations/views.py: perform_create()` |
| Production-safe error messages | `auto_annotate()` hides tracebacks in production |
| Optimistic drag-and-drop updates | `useTaskStore: moveTask()` |
| Auth token auto-attach & 401 auto-logout | `lib/api.ts` interceptors |
| Normalized coordinate drawing system | `DrawingCanvas.tsx` |
| Konva 3-layer rendering | `DrawingCanvas.tsx` |
| Image filter controls (brightness/invert) | `DrawingCanvas.tsx` |
| YOLO format export | `annotate/page.tsx: exportYOLOFormat()` |
| Deep-link from task card to annotate page | `TaskCard.tsx` → `/annotate?imageId=N` |

---

## 13. Deployment: Render + Vercel

### Backend on Render

1. Render reads `render.yaml` and creates the service and database automatically
2. On each push to `main`, Render runs `build.sh`:
   - `pip install -r requirements.txt` — installs all Python packages
   - `python manage.py collectstatic --no-input` — collects Django admin CSS/JS
   - `python manage.py migrate` — applies any new migrations to PostgreSQL
3. Render starts the server with `gunicorn backend.wsgi:application`
4. Environment variables auto-injected by Render:
   - `DATABASE_URL` — PostgreSQL connection string from the linked DB
   - `RENDER_EXTERNAL_HOSTNAME` — used to set `ALLOWED_HOSTS`
   - `RENDER` — presence of this var sets `DEBUG=False`
5. You must manually set: `FRONTEND_URL` (your Vercel URL)

**Media files on Render:** Render has an ephemeral filesystem — uploaded images are lost on each deploy. For production, you would need Cloudinary or AWS S3 (`django-storages`). In development and for demo purposes, the local `media/` folder works fine.

### Frontend on Vercel

1. Import the `frontend/` directory as a Vercel project
2. Set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/`
3. Vercel runs `npm run build` (Next.js Turbopack build)
4. Static pages are served from Vercel's global CDN

**Why no cookie issues:** The frontend sends `Authorization: Token ...` headers. No cookies cross the Vercel ↔ Render domain boundary.

---

## 14. Running Locally

### Backend

```bash
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate          # Windows
# source venv/bin/activate      # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create database tables
python manage.py migrate

# Create a user (or use /api/auth/register/ from the UI)
python manage.py createsuperuser

# Start server
python manage.py runserver
# → http://localhost:8000/api/
# → http://localhost:8000/admin/
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Environment Variables

The frontend's `.env.local` should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/
```
This is the default in `api.ts` and works without any setup locally.

---

## 15. Pros & Cons Analysis

### Architecture: Modular Monolith

| ✅ Pros | ❌ Cons |
|---|---|
| Single deployment unit — one Render service | Cannot scale Tasks and Annotations independently |
| Cross-domain DB queries in a single SQL JOIN | A bug in YOLO inference could crash the whole server |
| Zero distributed system complexity | Deployment of a new feature requires redeploying everything |
| Fast iteration — one codebase to update | |

### Authentication: Token Auth

| ✅ Pros | ❌ Cons |
|---|---|
| Zero cross-origin cookie issues | Token never expires — no automatic session expiry |
| Works across any two domains | If `localStorage` is compromised, attacker has a permanent token |
| Simple to implement and debug | No refresh token mechanism — user must log in again after logout |

### Database: JSONField for tags and polygon coordinates

| ✅ Pros | ❌ Cons |
|---|---|
| Single query to get a task with all its tags | Cannot efficiently filter tasks by specific tag using SQL index |
| Flexible — tags can be any strings without schema changes | Cannot enforce tag uniqueness at the DB level |
| Polygon data doesn't require a complex join | PostgreSQL's JSON operators are slower than indexed columns for filtering |

### Coordinate Normalization for polygons

| ✅ Pros | ❌ Cons |
|---|---|
| Resolution-independent — works at any canvas size | Slight floating-point precision loss on each conversion |
| Portability — annotations can be exported to any tool | Harder to debug (you see `0.142...` instead of `1024px`) |

### Frontend: Zustand + Optimistic Updates

| ✅ Pros | ❌ Cons |
|---|---|
| UI feels instant — no loading spinners on most interactions | State can be briefly inconsistent (UI shows "done" before server confirms) |
| Simple API — no Redux boilerplate | Rollback logic must be written manually for every mutation |
| Works offline for reads (data already in memory) | |

---

## 16. What Can Be Improved

### High Priority (Production Blockers)

1. **Persistent Media Storage** — Render's ephemeral filesystem loses uploaded images on every deploy. Integrate `django-storages` + Cloudinary or AWS S3 to store images in the cloud.

2. **Token Expiry / Refresh Tokens** — The current token never expires. Implement JWT with `djangorestframework-simplejwt`: short-lived access tokens (15 min) + long-lived refresh tokens (7 days). Auto-refresh in the Axios interceptor.

3. **YOLO Model Storage** — The `yolov8n-seg.pt` model file (7MB) is committed to the git repo. For production, download it at runtime from a URL (e.g., Hugging Face) and cache it in a persistent storage volume.

### Security Improvements

4. **Input Sanitization** — Add DRF validators for the `tags` JSONField to reject deeply nested objects or arrays of unexpected types.

5. **File Type Validation** — The current `ImageField` validates that the uploaded bytes are a valid image (good), but allows any image type. Add a custom validator to restrict to specific types (PNG, JPG, DICOM-derived PNGs).

6. **Rate Limiting Granularity** — Add per-endpoint throttling for the auto-annotate endpoint since YOLO inference is CPU-intensive. E.g., `5/minute` per user.

### Features to Add

7. **Real-time Collaboration** — Add Django Channels + WebSockets so multiple users can see task changes in real-time without refreshing. Use Redis as the channel layer.

8. **Annotation Labels / Classes** — Each polygon currently has no label (it defaults to YOLO class 0). Add a `label` or `class_name` field to `PolygonAnnotation` and let users specify what each region represents (e.g., "tumor", "lesion").

9. **Undo History** — The canvas has `Ctrl+Z` for undoing individual points during drawing, but no undo for saved annotations. A full undo stack would require storing edit history in the store.

10. **Pagination** — The task list and image list fetch all records in a single request. For large datasets, add DRF `PageNumberPagination` on the backend and infinite scroll on the frontend.

11. **Unit and Integration Tests** — The `tests.py` files in each app are empty. Add DRF `APITestCase` tests for each endpoint, especially the security-critical `get_queryset` filters and `perform_create` ownership checks.

12. **User Roles** — Add a `role` field to users (e.g., `radiologist`, `admin`, `trainee`) with different permissions for each. DRF's `IsAdminUser` permission and custom permission classes make this straightforward.

13. **Audit Logging** — Track who changed what and when. Use Django's signals (`post_save`) to write to an `AuditLog` table.

14. **Docker / docker-compose** — Add a `docker-compose.yml` so the full stack (Django + PostgreSQL + Redis) can be started with `docker compose up`. Eliminates "works on my machine" issues.

---

*Documentation generated from a complete audit of every source file in the repository — July 2026.*
