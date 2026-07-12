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

    class Meta:
        model = AnnotationImage
        fields = ['id', 'image', 'uploaded_at', 'polygons']
        read_only_fields = ['id', 'uploaded_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and getattr(instance.image, 'url', None):
            url = instance.image.url
            if request is not None:
                ret['image'] = request.build_absolute_uri(url)
            else:
                ret['image'] = url
        else:
            ret['image'] = None
        return ret
