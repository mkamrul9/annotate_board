# Phase 4: The Kanban Board & Optimistic UI

This document outlines the fourth phase of the project: building the highly responsive Kanban board using Next.js, Zustand, and `@hello-pangea/dnd` (a modern fork of react-beautiful-dnd).

## 1. The Zustand Task Store
To make the board feel instantaneous, we implemented "optimistic updates" in our global state manager.

### `src/store/useTaskStore.ts`
*   **What we wrote**: We expanded our Zustand store to handle fetching tasks, changing dates, and moving tasks between statuses.
*   **Why**: 
    *   **Optimistic UI**: In the `moveTask` function, we instantly update the frontend UI state *before* the API request finishes. If the API request to Django fails, we automatically roll back the UI to its original state. This eliminates all loading spinners and lag during drag-and-drop actions.
    *   **Date Synchronization**: When the `selectedDate` changes, the store automatically triggers a new `fetchTasks()` call, keeping the data perfectly in sync.

### `tasks/views.py` (Backend Update)
*   **What we updated**: We modified the `get_queryset` method on the Django backend to filter tasks by `due_date` if the query parameter is present in the request.

## 2. Modular React Components
We decoupled the UI into focused, reusable components.

### `src/components/tasks/DateSelector.tsx`
*   **What we built**: A clean date picker using `date-fns` to handle date math (subDays, addDays) and `lucide-react` for icons.
*   **Why**: It binds directly to the Zustand store, allowing users to toggle between days seamlessly without prop-drilling state down from the parent.

### `src/components/tasks/TaskCard.tsx`
*   **What we built**: The draggable item representing a single task. We wrapped it in the `<Draggable>` context from `@hello-pangea/dnd`.
*   **Why**: We utilized the `snapshot.isDragging` property to dynamically apply Tailwind classes, making the card elevate (shadow-2xl, scale-105) and gain a border when picked up by the user.

### `src/components/tasks/Column.tsx`
*   **What we built**: The droppable container for a specific status (TODO, IN_PROGRESS, DONE).
*   **Why**: We used `snapshot.isDraggingOver` to highlight the column when a user hovers a task over it, providing clear visual feedback.

## 3. Assembling the Main Page
Finally, we brought all the components together on the `/tasks` route.

### `src/app/tasks/page.tsx`
*   **What we built**: The main board wrapper that integrates the `<DragDropContext>`.
*   **Why**: 
    *   **Hydration Fix**: We implemented a `mounted` state check. Since drag-and-drop libraries rely heavily on the browser DOM, rendering them server-side in Next.js causes hydration mismatches. The `mounted` check ensures the board only renders on the client.
    *   **The Logic Loop**: When a drag ends (`onDragEnd`), we calculate the destination column and pass the task ID and new status to our Zustand store's `moveTask` action, completing the full frontend-to-backend interaction cycle.

**Challenges & Solutions during Phase 4:**
*   *Challenge*: Drag-and-drop lag when waiting for the database to confirm a task move.
    *   *Solution*: Implemented Optimistic Updates in Zustand to update the UI synchronously while the API patches the backend asynchronously.
*   *Challenge*: Hydration errors in Next.js when using `@hello-pangea/dnd`.
    *   *Solution*: Wrapped the return statement in a `mounted` check (`if (!mounted) return null;`) to force client-side rendering of the board.
