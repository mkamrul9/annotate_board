# Phase 5: Complete Kanban CRUD & Modal Operations

This document outlines the fifth phase of the project: adding the ability to create, edit, and delete tasks directly from the UI, and wiring those actions to our backend API.

## 1. Expanding the Zustand Store
We needed to add functions to handle the C, U, and D in CRUD (since Read was done in Phase 4).

### `src/store/useTaskStore.ts`
*   **What we wrote**: Added `addTask`, `updateTask`, and `deleteTask` to our global store.
*   **Why**: 
    *   **Auto-assignment**: For `addTask`, we automatically merge the `selectedDate` from the store into the POST payload. This ensures that when a user creates a task, it drops perfectly into the date they are currently looking at, saving them from having to select the date manually in a form.
    *   **Optimistic UI (Again)**: Both `updateTask` and `deleteTask` immediately update the `tasks` array in the UI *before* the API call finishes. This keeps the application feeling instantly responsive. If an error occurs, we catch it and roll the UI back.

## 2. The Task Modal
Instead of having separate forms for adding and editing tasks, we built one robust modal to handle both.

### `src/components/tasks/TaskModal.tsx`
*   **What we built**: A form wrapped in a fixed, backdrop-blur overlay using Tailwind CSS.
*   **Why**: 
    *   **Dual Purpose**: The modal takes an `existingTask` prop. If it's provided, it runs a `useEffect` hook to automatically populate the form fields (acting as an "Edit Form"). If it's null, it clears the fields (acting as a "New Form").
    *   **Tag Parsing**: The UI allows users to type comma-separated tags (e.g. "urgent, bug"). The `handleSubmit` function intercepts this string, splits it by commas, trims whitespace, and packages it into the exact JSON Array format expected by our Django `JSONField`.

## 3. Wiring It Up via Prop-Drilling
We integrated the Modal and the "Add Task" button into the main page, and made existing tasks clickable.

### `src/app/tasks/page.tsx` & Component Chain
*   **What we updated**: Added the "New Task" button to the header and placed the `<TaskModal>` at the bottom of the DOM tree. We also passed an `onEditTask` function down the component tree.
*   **Why**: 
    *   **The Click Chain**: A click on a `TaskCard` triggers an `onEdit` callback. This is passed up through `Column` and finally caught by `TasksPage`.
    *   **The State Flip**: `TasksPage` catches the clicked task, sets it as the `editingTask` state, and flips `isModalOpen` to true. This forces the `TaskModal` to appear, pre-filled with the selected task's data.

**Challenges & Solutions during Phase 5:**
*   *Challenge*: Passing click events from deeply nested `TaskCard` components up to the page-level state to trigger a modal.
    *   *Solution*: Utilized a standard React pattern (passing callback functions via props). We threaded `onEditTask` through `TasksPage` -> `Column` -> `TaskCard`.
*   *Challenge*: Converting user-friendly string input for tags into a clean JSON Array for the backend.
    *   *Solution*: Used standard JavaScript array manipulation (`tagsInput.split(',').map(t => t.trim()).filter(Boolean)`) before sending the payload.
