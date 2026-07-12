import os
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from django.conf import settings

from .models import AnnotationImage, PolygonAnnotation
from .serializers import AnnotationImageSerializer, PolygonAnnotationSerializer

# ---------------------------------------------------------------------------
# YOLO model — lazy singleton to avoid slow cold-start on Render
# ---------------------------------------------------------------------------
_yolo_model = None


def get_yolo_model():
    """Load the YOLO model once and cache it for the process lifetime."""
    global _yolo_model
    if _yolo_model is None:
        from ultralytics import YOLO
        model_path = os.environ.get('YOLO_MODEL_PATH', 'yolov8n-seg.pt')
        _yolo_model = YOLO(model_path)
    return _yolo_model


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------

class AnnotationImageViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return images for the authenticated user.
        prefetch_related('polygons') eliminates N+1 queries for nested polygon data.
        """
        return (
            AnnotationImage.objects
            .filter(user=self.request.user)
            .prefetch_related('polygons')
            .order_by('-uploaded_at')
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def auto_annotate(self, request, pk=None):
        """
        Run YOLO segmentation on the image and save detected polygons.
        Returns the newly created polygon annotations.
        """
        annotation_image = self.get_object()
        image_path = annotation_image.image.path

        try:
            model = get_yolo_model()
            results = model(image_path)
            result = results[0]

            if result.masks is None:
                return Response(
                    {"message": "No objects detected in this image."},
                    status=status.HTTP_200_OK
                )

            img_height, img_width = result.orig_shape
            new_polygons = []

            for mask in result.masks.xy:
                if len(mask) < 3:
                    continue  # Skip degenerate masks with fewer than 3 points

                normalized_points = [
                    [float(point[0]) / img_width, float(point[1]) / img_height]
                    for point in mask
                ]

                poly = PolygonAnnotation.objects.create(
                    image=annotation_image,
                    points=normalized_points,
                )
                new_polygons.append(poly)

            serializer = PolygonAnnotationSerializer(new_polygons, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except FileNotFoundError:
            return Response(
                {"error": "Image file not found on disk."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            return Response(
                {"error": error_detail, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PolygonAnnotationViewSet(viewsets.ModelViewSet):
    serializer_class = PolygonAnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Users can only access polygons belonging to their own images."""
        return PolygonAnnotation.objects.filter(image__user=self.request.user)

    def perform_create(self, serializer):
        """
        Validate that the image belongs to the requesting user before saving.
        Uses get_object_or_404 to return a 404 instead of crashing with DoesNotExist.
        """
        image_id = self.request.data.get('image')
        image = get_object_or_404(
            AnnotationImage,
            id=image_id,
            user=self.request.user
        )
        serializer.save(image=image)
