# Phase 3: Authentication and Security

This document outlines the third phase of the project: securely bridging the Next.js frontend with the Django backend using Token Authentication, global state management, and an API interceptor.

## 1. Backend Token Auth Configuration
By default, Django uses session cookies which are great for monolithic apps but cumbersome for decoupled Next.js architectures. We implemented token-based authentication.

### `backend/settings.py` & `backend/urls.py`
*   **What we did**: Added `'rest_framework.authtoken'` to `INSTALLED_APPS` and wired up `obtain_auth_token` to the `/api/auth/login/` URL.
*   **Why**: This generates a database table for tokens. When a user submits valid credentials to that endpoint, Django responds with a unique token (e.g., `{"token": "xyz123..."}`) that can be used to authenticate future requests.

## 2. Frontend Global State (Zustand)
We needed a way to remember that the user is logged in as they navigate around the Next.js application.

### `src/store/useAuthStore.ts`
*   **What we wrote**: We built a global `useAuthStore` using Zustand.
*   **Why**: It holds the `token` and `isAuthenticated` boolean in memory, and persists the token to the browser's `localStorage` so the user doesn't get logged out if they refresh the page.

## 3. Axios Interceptor (The API Client)
Manually attaching the authentication token to every single `fetch` or `axios` call is repetitive and prone to errors.

### `src/lib/api.ts`
*   **What we wrote**: We created an Axios instance (`api`) and added request and response interceptors.
*   **Why**: 
    *   **Request Interceptor**: Before any request leaves the frontend, it checks the `useAuthStore` for a token. If one exists, it automatically injects the `Authorization: Token <token>` header.
    *   **Response Interceptor**: If the backend ever responds with a `401 Unauthorized` (e.g., if the token was deleted or expired), it automatically triggers the `logout()` action in our store and redirects the user back to the login screen.

## 4. The Login UI
We built the aesthetic and functional entry point to the application.

### `src/app/page.tsx`
*   **What we built**: A "Bio-Tech Dark Mode" inspired login page using Tailwind CSS.
*   **Why**: It handles the form submission, triggers the `api.post` to Django, updates our Zustand store upon success, and gracefully displays error messages upon failure. It serves as a beautiful first impression of the portal.

**Challenges & Solutions during Phase 3:**
*   *Challenge*: Dealing with `window is not defined` errors when Next.js tries to server-side render (SSR) code that accesses `localStorage`.
    *   *Solution*: Added `typeof window !== 'undefined'` checks during the Zustand store initialization to safely read from `localStorage` only on the client side.
