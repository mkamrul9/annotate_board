from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'priority', 'status', 'due_date', 'tags', 'created_at']
        read_only_fields = ['id', 'created_at']

    # Custom validation example to show you care about data integrity
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Task title cannot be empty.")
        return value
