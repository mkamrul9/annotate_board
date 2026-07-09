from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    # SerializerMethodField with null-guard to prevent AttributeError
    # when annotation_image is None (tasks without attached scans).
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'priority', 'status', 'due_date',
            'tags', 'subtasks', 'annotation_image', 'image_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj) -> str | None:
        """Safely return the image URL or None if no image is attached."""
        if obj.annotation_image and obj.annotation_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.annotation_image.image.url)
            return obj.annotation_image.image.url
        return None

    def validate_title(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Task title cannot be empty.")
        return value.strip()
