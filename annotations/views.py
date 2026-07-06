from rest_framework import viewsets, permissions
from .models import AnnotationImage, PolygonAnnotation
from .serializers import AnnotationImageSerializer, PolygonAnnotationSerializer

class AnnotationImageViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AnnotationImage.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
