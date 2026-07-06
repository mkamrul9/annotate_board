# Phase 2: Building the API Layer

This document outlines the second phase of the project, which involved setting up the Django REST Framework (DRF) APIs for the Tasks and Annotations domains.

## 1. Serializers (Data Transformers)
Serializers act as translators between our Django models and the JSON format required by the Next.js frontend, while also validating incoming data.

### `tasks/serializers.py`
*   **What we wrote**: We created `TaskSerializer` linked to the `Task` model.
*   **Why**: It explicitly defines which fields are exposed to the frontend and which are read-only (`id`, `created_at`). We also implemented a custom `validate_title` method to ensure tasks cannot be created with empty or whitespace-only titles, guaranteeing data integrity.

### `annotations/serializers.py`
*   **What we wrote**: We created `PolygonAnnotationSerializer` and `AnnotationImageSerializer`.
*   **Why**: To allow the frontend to fetch an image and all of its drawn polygons in a single network request, we nested the `PolygonAnnotationSerializer` inside the `AnnotationImageSerializer`.

## 2. API Views (The Logic)
We utilized DRF's `ModelViewSet` to automatically generate full CRUD (Create, Read, Update, Delete) endpoints without writing repetitive boilerplate code.

### `tasks/views.py` & `annotations/views.py`
*   **What we wrote**: We created `TaskViewSet`, `AnnotationImageViewSet`, and `PolygonAnnotationViewSet`.
*   **Why**:
    *   **Data Isolation (Security)**: We overrode `get_queryset()` in every view to strictly filter data by `self.request.user`. This ensures a user can *only* fetch, update, or delete their own tasks and images.
    *   **Automatic Association**: We overrode `perform_create()` to automatically assign the logged-in user to any new task or image being created. This prevents users from having to send their user ID in the request, avoiding a massive security flaw.

## 3. URL Routing
We exposed the views as RESTful endpoints using DRF's built-in routers.

*   **`tasks/urls.py` & `annotations/urls.py`**: We registered the viewsets with a `DefaultRouter` to automatically generate all the necessary `/api/tasks/`, `/api/annotations/images/`, and `/api/annotations/polygons/` URL paths.
*   **`backend/urls.py`**: We imported these domain-specific URLs and mounted them to the main project route tree. We also added DRF's built-in token auth endpoints to easily handle logins later.

## 4. Media File Configuration
*   **`backend/settings.py` & `backend/urls.py`**: We configured `MEDIA_URL` and `MEDIA_ROOT`, and updated the main `urls.py` to serve static media files locally during development.
*   **Why**: Django needs to know exactly where on the hard drive to save uploaded user images, and it needs a specific URL pattern to serve those images back to the Next.js `<img src="..." />` tags.

**Challenges & Solutions during Phase 2:**
*   *Challenge*: Ensuring users cannot access or modify each other's data (Data Isolation).
    *   *Solution*: Rather than trusting the frontend, we strictly filtered the `get_queryset` method at the database level for all views to `user=self.request.user`.
*   *Challenge*: Efficiently loading an image and its annotations without suffering from the N+1 query problem or requiring multiple network requests.
    *   *Solution*: Utilized nested serializers so fetching an image automatically embeds its array of polygon coordinates.
