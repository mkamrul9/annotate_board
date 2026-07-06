# Phase 6: The Canvas Annotation Tool

This document details the construction of our "Phase 3 Boss Fight" component: The medical imaging annotation engine. This tool allows users to upload images and draw bounding polygons around regions of interest.

## 1. Normalized Coordinate System (The Core Concept)
To ensure our annotations are robust, scalable, and independent of device size, we store **normalized coordinates** (percentages from 0.0 to 1.0) rather than raw pixels.
*   **Why**: If a radiologist draws a polygon on a massive 4K monitor, and a resident later views it on a 13-inch laptop screen, raw pixel values would be completely wrong. Normalizing coordinates guarantees the polygon maps perfectly to the image matrix regardless of the display size. This is standard practice in ML/CV pipelines (like YOLO bounding boxes).

## 2. The Annotation Store
We built a dedicated Zustand store (`src/store/useAnnotationStore.ts`) to handle the heavy lifting for the canvas.

*   **What it does**:
    *   **Image Uploads**: It packages standard Javascript `File` objects into `FormData` so Django can process the multi-part request and store the binary file securely in the `media/` directory.
    *   **Polygons**: It handles POST and DELETE operations for annotations, linking them back to the active `imageId`.
    *   **Carousel State**: It tracks the `currentIndex` of the image array so the user can cycle through their uploaded scans.

## 3. The Konva Drawing Engine
We used `react-konva` to tap into the HTML5 `<canvas>` API for high-performance rendering.

### `src/components/annotate/DrawingCanvas.tsx`
*   **Dynamic Resizing**: We implemented a `useEffect` that listens to `window.addEventListener('resize')`. This ensures the Canvas perfectly fills its Tailwind container.
*   **Denormalization**: While the database stores `0.5`, the canvas needs pixels. The `denormalizePoints` function dynamically multiplies the database percentages by the current `dimensions.width` and `dimensions.height`.
*   **Interaction Design**: 
    *   Left-clicking drops green vertices that connect into a live-drawing polygon.
    *   Right-clicking an existing completed polygon triggers a deletion prompt.

## 4. The Annotation Page
We wired the store and the canvas together at `src/app/annotate/page.tsx`.

*   **Uploader**: A hidden `<input type="file" />` triggered by a styled button allows seamless file uploads without ugly default browser buttons.
*   **Slider**: Next/Prev buttons cycle through the `images` array from the store, dynamically swapping out the `imageObj` passed into the `<DrawingCanvas>`.

**Challenges & Solutions during Phase 6:**
*   *Challenge*: Dealing with HTML `<canvas>` which operates on absolute pixels, while needing relative database storage.
    *   *Solution*: Intercepted pointer coordinates on click, divided by the canvas dimensions to store normalized values, and re-multiplied them during render.
*   *Challenge*: Loading external image URLs cleanly into the Konva canvas.
    *   *Solution*: Installed `use-image` to handle the asynchronous HTML `Image` object loading internally, passing it smoothly to the `<KonvaImage>` component once loaded.
