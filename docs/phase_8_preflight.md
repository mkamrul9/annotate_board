# Phase 8: Final Pre-Flight Checklist

This document serves as the final operational checklist before submitting the VAI Radiology Engineering Assessment. It ensures the deployment is flawless, the repositories are structured correctly, and the presentation hits every key requirement.

## 1. Version Control Strategy (The Monorepo vs. Split Repos)
The prompt suggests separating the frontend and backend into two repositories. However, because we built this as a cohesive unit and committed our changes phase-by-phase (Phases 1 through 7), we have generated a highly professional, granular commit history in our current monorepo. 

**Recommendation:** Submit this single repository as a "Monorepo". Reviewers strongly prefer seeing a continuous commit history showing how the architecture evolved over time (from Django setup, to API, to Zustand, to Canvas). 
*   If they strictly demand two links in the Google Form, you can provide the same GitHub link twice, appending `/tree/main/frontend` for the frontend link.

## 2. Deployment & QA Testing
Deployment must be completed days before the deadline to allow time to iron out edge cases.

### Backend (Render / Railway)
1.  **Environment Variables**: Ensure `DEBUG = False` and your frontend's deployed URL (e.g., `https://vai-radiology-ui.vercel.app`) is explicitly listed in `CORS_ALLOWED_ORIGINS` in `settings.py`.
2.  **Static Files**: The `whitenoise` middleware and `build.sh` script we created in Phase 7 will handle collecting the admin CSS automatically.
3.  **Database**: If deploying to Render, SQLite will be wiped on every deploy unless attached to a Persistent Disk. For a take-home demo, this is acceptable, but ensure you run `python manage.py createsuperuser` via the Render shell after deployment so the demo credentials work.

### Frontend (Vercel)
1.  **Environment Variables**: In the Vercel dashboard, add `NEXT_PUBLIC_API_URL` and point it strictly to your live Render backend URL (e.g., `https://vai-backend.onrender.com/api/`). Do not include a trailing slash if your Axios configuration doesn't expect it.
2.  **QA Test**: Open the Vercel URL on your mobile phone or an Incognito window. Log in, drag a task, and draw a polygon. **If it works there, it works for the reviewer.**

## 3. The 2-Minute Video Masterclass
The video is the closer. Keep it strictly under 120 seconds. Do not explain *how* the code works; explain *why* the architecture is superior.

**Target Script Breakdown:**
*   **0:00 - 0:15**: Introduce yourself and log in. State the architecture: *"I chose a Modular Monolith in Django paired with a Next.js frontend to prioritize data cohesion and UI performance."*
*   **0:15 - 0:45**: Screen share `/tasks`. Drag a card between columns. Emphasize: *"I implemented optimistic UI updates using Zustand, so the UI updates instantly without waiting for network latency."*
*   **0:45 - 1:30**: Screen share `/annotate`. Upload an image and draw a polygon. The mic-drop moment: **Live-resize your browser window**. Say: *"I built a coordinate normalization engine. Because it saves vertices as percentages rather than pixels, the polygon scales perfectly onto the anatomy regardless of screen size."*
*   **1:30 - 1:45**: Mention that your deep-dive architectural decisions are in the READMEs. Sign off confidently.

## 4. Final Submission Checklist
Before hitting "Submit" on the Google Form (https://forms.gle/uNLWe5WVbCzHmNbPA), double-check:
*   [ ] GitHub Repository is set to **Public**.
*   [ ] Live Hosted App URL is working and tested on a mobile network.
*   [ ] Demo User Email & Password (e.g., `demo@vai.com` / `VaiAdmin2026!`) are verified on the live database.
*   [ ] Video Link is accessible (Unlisted YouTube or Loom).

You have built a secure, lightning-fast, production-ready application. Good luck!
