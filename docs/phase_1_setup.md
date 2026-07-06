# Phase 1: Project Initialization & Setup

This document outlines the first phase of the project setup, explaining what files were created, the purpose of each step, and how it was implemented.

## 1. Django Backend Setup & Models
First, we set up the data structures (models) for the database and connected them to Django.

### `tasks/models.py`
*   **What we wrote**: We defined the `Task` model.
*   **Why**: This tells the database how to store a task. We added fields for the `title`, `due_date`, and linked it to a `User` (the creator). We also created choice fields for `Priority` (Low, Medium, High) and `Status` (To Do, In Progress, Done). Lastly, we used a `JSONField` for `tags` to allow flexible, dynamic tags without needing complex database relationships.

### `annotations/models.py`
*   **What we wrote**: We defined two models: `AnnotationImage` and `PolygonAnnotation`.
*   **Why**: We split this into two parts. `AnnotationImage` stores the actual image file (using an `ImageField` which relies on the `Pillow` library we installed) and links it to the `User`. `PolygonAnnotation` links to an image and stores the drawn shapes as an array of coordinates in a `JSONField`. Storing coordinates as percentages ensures the shapes scale perfectly regardless of the screen size.

### `backend/settings.py`
*   **What we modified**: We added `'rest_framework'`, `'corsheaders'`, `'tasks'`, and `'annotations'` to the `INSTALLED_APPS` list.
*   **Why**: Django needs to explicitly be told about new apps and third-party libraries. This activates the Django REST Framework (for your future API), CORS headers (to allow your Next.js frontend to talk to your Django backend securely), and your two newly created data apps.

## 2. Django Admin Interface
We wanted to be able to immediately test and add dummy data, so we wired the models up to the Django Admin panel.

### `tasks/admin.py` & `annotations/admin.py`
*   **What we wrote**: We imported the models we just made and registered them using `@admin.register(...)`.
*   **Why**: This automatically generates a beautiful, out-of-the-box UI at `http://localhost:8000/admin/` where you can view, create, edit, and delete Tasks, Images, and Polygons without writing any frontend code yet.

## 3. Backend Execution & Database Initialization
Once the Python files were written, we ran commands in the terminal to bring the database to life.

*   **`pip install ...`**: Installed Django, Django REST Framework, CORS Headers, and Pillow (image processing).
*   **`python manage.py makemigrations` & `python manage.py migrate`**: These commands looked at the `models.py` files we wrote, generated SQLite database tables for them, and applied those tables to `db.sqlite3`.
*   **Created a Superuser**: We ran a background script to automatically create an admin account. 
    *   **Username**: `admin`
    *   **Password**: `admin`

## 4. Next.js Frontend Initialization
Next, we moved to the UI layer and created the `frontend` folder.

*   **`npx create-next-app`**: We ran this command to generate a brand new Next.js 15 application using the modern App Router, configured with TypeScript and TailwindCSS.
*   **`npm install ...`**: We installed the specific libraries needed for the project:
    *   `zustand`: For lightweight global state management.
    *   `@hello-pangea/dnd`: To build the drag-and-drop Kanban board for tasks.
    *   `react-konva` & `konva`: The HTML5 Canvas libraries that will allow users to draw polygons on images.
    *   `date-fns` & `lucide-react` & `axios`: For date formatting, beautiful icons, and fetching API data from Django.

## 5. Frontend Directory Architecture
We built out the empty folder structure and initial boilerplate files to keep the frontend clean and decoupled.

*   **Directories Created**:
    *   `src/app/(auth)/login/`, `src/app/tasks/`, `src/app/annotate/`: The actual page routes for the application.
    *   `src/components/ui/`, `src/components/tasks/`, `src/components/annotate/`: Folders to keep UI components grouped by their domain so they don't get cluttered.
*   **`src/store/useTaskStore.ts` & `src/store/useAuthStore.ts`**: We created these files and added the basic `zustand` boilerplate. This is where the global state will be defined.
*   **`src/lib/api.ts`**: We created an Axios instance pre-configured to point to `http://localhost:8000`. This ensures all frontend API calls easily talk to Django.

## 6. Version Control (Git)
Finally, the IDE automatically committed all of this work into Git with the message: `"feat: initialize Django backend with task/annotation models and Next.js frontend structure"`.

**Challenges & Solutions during Phase 1:**
*   *Challenge*: Creating dynamic tagging without introducing many-to-many relationship complexity.
    *   *Solution*: Utilized Django's built-in `JSONField` to store a list of tags.
*   *Challenge*: Ensuring polygon annotations scale gracefully across variable resolution screens.
    *   *Solution*: Designed the `PolygonAnnotation` points field to accept relative percentage coordinates (e.g. `[0.2, 0.5]`) rather than absolute pixel coordinates.
