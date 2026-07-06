# ☢️ VAI Radiology Portal - Frontend

A high-performance, modular Next.js application combining a responsive Kanban task manager with a medical-grade image annotation canvas. Built for the VAI Radiology Phase 2 Engineering Assessment.

## 📖 What We Built & Why
This application is a 2-in-1 workspace designed for medical professionals or AI data labelers. The goal was to build a UI that feels instant, looks pristine (a "Bio-Tech Dark Mode" aesthetic), and handles complex canvas interactions without breaking under pressure. 

Instead of throwing every trending library at the wall, the architecture is strictly pragmatic: every tool was chosen to maximize UX and developer velocity while minimizing boilerplate.

## 🛠 Technology Stack & The "Why"
* **Framework: Next.js 14 (App Router) + TypeScript.** Chosen over standard React (Vite) for built-in API route capabilities, superior routing, and seamless environment variable handling. TypeScript is strictly enforced to catch data-shape errors between the frontend and Django API.
* **State Management: Zustand.** Chosen over Redux (too much boilerplate for a two-domain app) and React Context (causes unnecessary re-renders). Zustand provides global, atomic state updates, which is critical for smooth drag-and-drop.
* **Styling: Tailwind CSS.** Chosen for rapid, utility-first styling that keeps bundle sizes small and enforces design system consistency without the runtime overhead of CSS-in-JS (like Styled Components).
* **Canvas Engine: React-Konva.** Writing raw HTML5 Canvas logic for drawing and editing polygons is highly imperative and prone to scaling bugs. Konva treats canvas shapes as reactive components, bridging the gap between React's declarative nature and the Canvas API.
* **Drag and Drop: @hello-pangea/dnd.** A robust, accessible, community-maintained fork of `react-beautiful-dnd`. Chosen over raw HTML5 drag-and-drop to ensure smooth animations and mobile compatibility.

## 🦹‍♂️ The Villains Faced & Conquered

### Villain 1: The Aspect-Ratio Paradox
**The Problem:** When drawing polygons on an image, capturing raw pixel coordinates (e.g., `X: 450, Y: 300`) creates a massive flaw. If a user draws on a 1080p monitor, and a reviewer opens it on a 13-inch laptop, the polygons render completely off-target.
**The Triumph:** Coordinate Normalization. I built a system that translates click events into percentages (0.0 to 1.0) of the current bounding box before saving them to the database. Upon rendering, the engine denormalizes these floats back into the current screen's dimensions. Polygons now lock perfectly onto the image anatomy, regardless of the screen size.

### Villain 2: Network Latency during Drag-and-Drop
**The Problem:** Waiting for an API response to move a Kanban card feels sluggish and breaks the user's flow.
**The Triumph:** Optimistic UI Updates. When a card is dropped, Zustand instantly updates the UI state. The API `PATCH` request fires silently in the background. The app only reverts the UI if the server returns a 500 error, resulting in a lightning-fast user experience.

## ✨ Core Functionalities
* **Authentication:** Secure Token-based login flow.
* **Kanban Board (`/tasks`):**
  * Date-synced task filtering (independent reusable `<DateSelector/>`).
  * Drag-and-drop tasks between "To Do", "In Progress", and "Done".
  * Full CRUD (Create, Read, Update, Delete) via modal interfaces.
* **Image Annotation (`/annotate`):**
  * Image upload directly to the Django backend.
  * Interactive carousel to slide through uploaded images.
  * Click-to-draw continuous polygon generation.
  * Right-click deletion of saved annotations.

## 🚀 How to Run Locally

**Prerequisites:**
* Node.js version: **v18.17.0** or higher
* npm or yarn installed

1. **Clone the repository:**
   ```bash
   git clone <your-frontend-repo-url>
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:** Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open** `http://localhost:3000` in your browser.

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See LICENSE for more information.
