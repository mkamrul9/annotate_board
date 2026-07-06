# ☢️ VAI Radiology Portal - Backend API

A robust, secure, and modular Django REST API powering the VAI Radiology task management and image annotation systems. 

## 📖 Architectural Philosophy: Modular Monolith vs. Microservices
For this task, I explicitly chose a **Modular Monolith** architecture over Microservices. While microservices are excellent for massive, distributed teams, introducing them for a two-domain application (Tasks and Annotations) is a classic case of over-engineering. 

By building a Modular Monolith in Django, we achieve:
1. **High Cohesion:** Relational data (Users mapping to Tasks and Images) lives in a unified, highly optimized SQLite/PostgreSQL database.
2. **Operational Simplicity:** Zero need for distributed tracing, complex API gateways, or container orchestration to get the app running.
3. **Domain Isolation:** The `tasks` app and `annotations` app are completely decoupled at the directory level, meaning this monolith is ready to be split into microservices in the future *only if* the scaling requirements demand it.

## 🛠 Technology Stack & The "Why"
* **Framework: Django & Django REST Framework (DRF).** Explicitly required by the prompt, but also the perfect tool for the job. DRF allows us to spin up secure, serialized CRUD endpoints in a fraction of the time it takes in Node.js/Express.
* **Database: SQLite.** Chosen as per the prompt's suggestion. Thanks to Django's ORM, this can be swapped to PostgreSQL in production by changing exactly one dictionary in `settings.py`.
* **Authentication: DRF Token Auth.** Chosen over Session Cookies to prevent nasty cross-origin (CORS) cookie-blocking issues between a decoupled Next.js frontend and a Django backend.
* **Image Handling: Pillow.** Essential Python library to validate and process incoming `FormData` image uploads.

## 🦹‍♂️ The Villains Faced & Conquered

### Villain 1: Dynamic Data in a Relational Database
**The Problem:** Task "tags" (e.g., `["urgent", "frontend"]`) and Polygon coordinates (e.g., `[[0.1, 0.2], [0.3, 0.4]]`) have dynamic lengths. Creating highly normalized Many-to-Many relational tables for these arrays would result in massive, slow SQL JOIN queries every time the Kanban board loads.
**The Triumph:** Leveraging Django's `JSONField`. By storing the tags and the normalized coordinate arrays as JSON directly within the `Task` and `Polygon` rows, we eliminated the need for secondary tables. Fetching a user's tasks requires exactly one SQL query, maximizing read performance.

### Villain 2: The Data Leakage Threat
**The Problem:** In a REST API, `GET /api/tasks/` typically returns all tasks in the database, meaning User A could see User B's data. 
**The Triumph:** Strict QuerySet Filtering. I overrode the `get_queryset()` methods on every ViewSet. The API intercepts the Auth Token, identifies the user, and strictly filters the database at the ORM level (`Task.objects.filter(user=self.request.user)`). Data isolation is mathematically guaranteed.

## ✨ Core API Functionalities
* `POST /api/auth/login/`: Validates credentials and issues an Auth Token.
* `GET, POST, PATCH, DELETE /api/tasks/`: Full CRUD for tasks. Supports filtering via `?due_date=YYYY-MM-DD`.
* `GET, POST /api/annotations/images/`: Handles multipart/form-data image uploads and returns images with their nested polygons.
* `POST, DELETE /api/annotations/polygons/`: Saves or deletes coordinate arrays mapped to specific images.

## 🚀 How to Run Locally

**Prerequisites:**
* Python version: **3.10.x** or higher

1. **Clone the repository:**
   ```bash
   git clone <your-backend-repo-url>
   cd backend
   ```
2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Run Database Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. **Create a Demo User (Superuser):**
   ```bash
   python manage.py createsuperuser
   ```
6. **Start the API server:**
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://localhost:8000/api/`.

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/BackendFeature`)
3. Commit your Changes (`git commit -m 'Add some BackendFeature'`)
4. Push to the Branch (`git push origin feature/BackendFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See LICENSE for more information.
