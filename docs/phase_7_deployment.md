# Phase 7: Polish & Deployment Prep

This document outlines the final phase of the project: ensuring the application is documented and ready for production deployment.

## 1. CORS Configuration (Cross-Origin Resource Sharing)
*   **What was done**: We ensured `django-cors-headers` was installed and properly configured in `settings.py`.
*   **Why**: Because our Next.js frontend and Django backend run on different ports (and eventually different domains in production), browsers will inherently block their communication. By adding the CORS middleware, Django explicitly tells the browser that requests from our frontend are safe and permitted.

## 2. Technical Documentation
*   **What was done**: Created a comprehensive `README.md` at the root of the project.
*   **Why**: Standard engineering practice (and a direct requirement of the assessment). The README acts as an architectural design record (ADR), explicitly defending the tech choices:
    *   Why we chose Zustand (lean global state).
    *   Why we used Optimistic UI updates (instant UX).
    *   Why we normalize Canvas coordinates (device-agnostic rendering).

## 3. Deployment Strategy
To deploy this application successfully:
1.  **Frontend (Vercel)**: Next.js is heavily optimized for Vercel. You simply connect your Git repository, set the Build Command to `npm run build`, and ensure `NEXT_PUBLIC_API_URL` is set in the environment variables to point to your live Django API.
2.  **Backend (Render / Railway / AWS)**: Django requires a slightly different setup. 
    *   You would typically swap SQLite for PostgreSQL.
    *   You must configure `ALLOWED_HOSTS` to include your live domain.
    *   Update `CORS_ALLOWED_ORIGINS` to strictly point to your Vercel frontend URL, removing the `CORS_ALLOW_ALL_ORIGINS = True` dev setting.
    *   Serve static/media files using a service like AWS S3 or Whitenoise.

**The final Boss Fight is complete. The application is secure, responsive, and ready for review.**
