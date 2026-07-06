from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    # This automatically fetches the URL so Next.js can render a thumbnail
    image_url = serializers.CharField(source='annotation_image.image.url', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'priority', 'status', 'due_date', 'tags', 'annotation_image', 'image_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    # Custom validation example to show you care about data integrity
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Task title cannot be empty.")
        return value
