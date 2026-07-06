# Bio-Tech Radiology Assessment

This is a full-stack web application designed for a Bio-Tech radiology context. It features a responsive drag-and-drop Kanban board for task management and an advanced HTML5 Canvas tool for annotating medical images with polygon regions of interest.

## Tech Stack Overview

### Frontend: Next.js (App Router)
*   **Why Next.js?**: Chosen for its robust App Router, excellent developer experience, and seamless integration with Tailwind CSS. It allows us to easily scale the application with mixed server-side and client-side rendering where appropriate.
*   **State Management (Zustand)**: We used Zustand over Redux. It provides a lean, boilerplate-free way to handle global state (like our Authentication tokens and Task stores) without sacrificing performance.
*   **Styling (Tailwind CSS)**: Used to rapidly build a cohesive, custom "Bio-Tech Dark Mode" aesthetic (slate-950/900 palette).
*   **Drag and Drop**: Utilized `@hello-pangea/dnd` (a modern, maintained fork of react-beautiful-dnd) to create the Kanban board.
*   **Annotation Engine**: Used `react-konva` to tap directly into the HTML5 canvas, enabling performant, lag-free polygon drawing over large medical images.

### Backend: Django & Django Rest Framework (DRF)
*   **Why Django?**: Django provides an incredibly robust, secure foundation. DRF's `ModelViewSet` allowed us to spin up secure, scalable CRUD endpoints rapidly.
*   **Authentication**: Implemented Django Token Authentication for stateless, decoupled security perfectly suited for a separate Next.js frontend.
*   **Data Flexibility**: Utilized `JSONField` in PostgreSQL/SQLite to store dynamic arrays (like task tags) and normalized polygon coordinate matrices without needing complex relational joins.

## Key Architectural Decisions

1.  **Optimistic UI Updates**: 
    To ensure the Kanban board feels instantaneous (zero-latency), the frontend Zustand store updates the UI *synchronously* before the API request completes. If the backend patch fails, the UI automatically rolls back.
2.  **Normalized Coordinate System**: 
    When drawing polygons on the medical images, we do not store raw pixel values. Instead, coordinates are normalized to percentages (0.0 to 1.0). This ensures that an annotation drawn on a 4K desktop monitor will render flawlessly and in the exact same proportional position on a 13-inch laptop screen.
3.  **Strict Data Isolation**: 
    Security is enforced at the database level. API viewsets strictly filter queries by the authenticated user (`Task.objects.filter(user=self.request.user)`). Even if a malicious request hits the API directly, a user can never access or modify another user's data.

## Local Setup Instructions

### 1. Start the Django Backend
```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework django-cors-headers pillow

# Run migrations and create a user
python manage.py migrate
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

### 2. Start the Next.js Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`. Log in using the superuser credentials you created.
