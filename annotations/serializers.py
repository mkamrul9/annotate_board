from rest_framework import serializers
from .models import AnnotationImage, PolygonAnnotation

class PolygonAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolygonAnnotation
        fields = ['id', 'points', 'created_at']
        read_only_fields = ['id', 'created_at']

class AnnotationImageSerializer(serializers.ModelSerializer):
    # Nested serializer to fetch an image and all its drawn polygons in one request!
    polygons = PolygonAnnotationSerializer(many=True, read_only=True)
    # Return an absolute URL so the frontend works regardless of deployment domain
    image = serializers.SerializerMethodField()

    class Meta:
        model = AnnotationImage
        fields = ['id', 'image', 'uploaded_at', 'polygons']
        read_only_fields = ['id', 'uploaded_at']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None
