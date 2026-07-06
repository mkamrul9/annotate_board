# VAI Radiology Assessment: Frontend 

A high-performance, modular Next.js application combining a responsive Kanban board with a medical-grade image annotation canvas.

## ⚔️ The Villain: The Aspect-Ratio Paradox
The biggest villain in building the `/annotate` tool wasn't drawing the polygons—it was **persistence across screen sizes**. If I drew a polygon on a 1080p monitor and saved the exact $X$ and $Y$ pixel coordinates, those points would render completely off-target when viewed on a 13-inch laptop. 

**The Weapon:** Coordinate Normalization. 
Instead of saving raw pixels, I calculated the vertices as percentages of the current canvas bounding box (values between `0.0` and `1.0`). When the image is rendered on a new screen, the engine scales these normalized floats back into the current viewport dimensions. The polygons lock perfectly onto the image anatomy, regardless of aspect ratio or window size.

## 🛠 Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript 
* **State Management:** Zustand (Zero-boilerplate, highly performant)
* **Canvas Engine:** React-Konva
* **Drag-and-Drop:** @hello-pangea/dnd

## 🚀 How to Run Locally

**Requirements:** Node.js (v18.17.0 or higher)

1. Clone the repository and navigate to the frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add the local API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### 3. Deployment Strategy

*   **Frontend (Vercel):** Just push your Next.js code to GitHub, connect the repo to Vercel, and add your deployed backend's URL as the `NEXT_PUBLIC_API_URL` environment variable.
*   **Backend (Render):** Render is the easiest platform for Django. 
    1. Add a `requirements.txt` (`pip freeze > requirements.txt`).
    2. Add a `build.sh` script to automate migrations:
       ```bash
       #!/usr/bin/env bash
       set -o errexit
       pip install -r requirements.txt
       python manage.py collectstatic --no-input
       python manage.py migrate
       ```
    3. Connect your backend repo to Render as a "Web Service", set the build command to `./backend/build.sh`, and the start command to `gunicorn backend.wsgi`.
