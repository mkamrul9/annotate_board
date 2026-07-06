from rest_framework import viewsets, permissions
from .models import AnnotationImage, PolygonAnnotation
import cv2
import numpy as np
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ultralytics import YOLO
from .serializers import AnnotationImageSerializer, PolygonAnnotationSerializer

# Load the model once when the server starts
model = YOLO('yolov8n-seg.pt')
class AnnotationImageViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AnnotationImage.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def auto_annotate(self, request, pk=None):
        try:
            annotation_image = self.get_object()
            image_path = annotation_image.image.path
            
            # 1. Run YOLO Inference
            results = model(image_path)
            result = results[0]
            
            if result.masks is None:
                return Response({"message": "No objects detected"}, status=status.HTTP_200_OK)

            # 2. Get original image dimensions for normalization
            img_height, img_width = result.orig_shape

            new_polygons = []
            
            # 3. Extract masks and convert to normalized polygons
            for mask in result.masks.xy:
                # mask is an array of [x, y] coordinates in original pixel space
                if len(mask) < 3:
                    continue # Skip invalid tiny masks
                    
                normalized_points = []
                for point in mask:
                    norm_x = float(point[0]) / img_width
                    norm_y = float(point[1]) / img_height
                    normalized_points.append([norm_x, norm_y])
                
                # 4. Save to database
                poly = PolygonAnnotation.objects.create(
                    image=annotation_image,
                    points=normalized_points
                )
                new_polygons.append(poly)

            serializer = PolygonAnnotationSerializer(new_polygons, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PolygonAnnotationViewSet(viewsets.ModelViewSet):
    serializer_class = PolygonAnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Security check: Ensure users can only fetch polygons on their own images
        return PolygonAnnotation.objects.filter(image__user=self.request.user)

    def perform_create(self, serializer):
        # The frontend will pass the image_id in the URL or payload
        image_id = self.request.data.get('image')
        image = AnnotationImage.objects.get(id=image_id, user=self.request.user)
        serializer.save(image=image)
