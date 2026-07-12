# ☢️ Annotate Board Portal - Backend

A robust, production-grade Django API serving a task management Kanban board and an AI-powered image annotation tool. Built for the VAI Radiology Phase 2 Engineering Assessment.

## 📖 What We Built & Why
This backend is the source of truth for the entire Annotate Board application. It provides token-based authentication, full CRUD capabilities for tasks via Django REST Framework, and persistent storage for images and polygonal annotations. It is also strictly responsible for running our deep-learning Computer Vision model (YOLOv8) to auto-annotate uploaded images.

## 🛠 Technology Stack & The "Why"
* **Framework: Django 6.0 + Django REST Framework.** Chosen for its rapid development cycle, built-in ORM, and out-of-the-box token authentication.
* **Database: PostgreSQL (Production) / SQLite (Local).** SQLite provides zero-config local development, while PostgreSQL ensures data integrity in production.
* **AI Engine: Ultralytics YOLOv8.** State-of-the-art segmentation. Integrated directly into a custom Django action to provide instant, automated region labeling for uploaded medical images.
* **Static Files: WhiteNoise.** Allows Django to serve its own static files efficiently in production without requiring an external CDN or Nginx setup.

## 🦹‍♂️ The Villains Faced & Conquered

### Villain 1: The Out-Of-Memory (OOM) Killer on Free Tier Servers
**The Problem:** Running a PyTorch-based YOLOv8 model for image segmentation requires significant RAM. Our production server (Render Free Tier) strictly caps memory at 512MB. The moment a user clicked "Auto-Annotate", PyTorch spawned multiple background threads and rapidly consumed >600MB of RAM, causing the Linux OOM killer to immediately terminate the web worker (resulting in 502 Bad Gateway / 500 HTML errors).
**The Triumph:** Aggressive PyTorch Profiling & Optimization. I bypassed the memory constraints by forcing `torch.set_num_threads(1)` to limit thread-pool overhead. Furthermore, I reduced the YOLO inference tensor size (`imgsz=320`), which dramatically slashed the RAM requirement while maintaining accurate enough predictions for our polygon masks. The model now comfortably fits inside the 512MB limit.

### Villain 2: Missing GL Libraries in Headless Linux
**The Problem:** The `ultralytics` package depends on `opencv-python`, which intrinsically expects desktop OpenGL libraries (`libGL.so.1`). In a headless Ubuntu environment like Render, importing the model threw a catastrophic `ImportError`.
**The Triumph:** Dependency Overriding. By forcefully removing `opencv-python` and instructing pip to explicitly install `opencv-python-headless` in `requirements.txt`, I ensured that all computer vision operations could run perfectly on a pure server environment without relying on graphical X11/GL bindings.

## 🚀 How to Run Locally

**Prerequisites:**
* Python version: **3.11.9** (or higher 3.11.x)
* pip installed

1. **Clone the repository:**
   ```bash
   git clone <your-backend-repo-url>
   cd backend
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Setup:** Ensure your `.env` (if applicable) is set up, though the app defaults to SQLite locally automatically.
5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```
6. **Create a superuser (or seed demo data):**
   ```bash
   python manage.py createsuperuser
   # OR
   python manage.py seed_demo
   ```
7. **Start the development server:**
   ```bash
   python manage.py runserver
   ```
8. **Open** `http://localhost:8000/api/` in your browser to view the browsable API.

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingBackend`)
3. Commit your Changes (`git commit -m 'Add some AmazingBackend'`)
4. Push to the Branch (`git push origin feature/AmazingBackend`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See LICENSE for more information.
