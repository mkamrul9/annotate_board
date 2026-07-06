from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated] # Enforce login

    def get_queryset(self):
        # Only return tasks belonging to the logged-in user
        queryset = Task.objects.filter(user=self.request.user)
        due_date = self.request.query_params.get('due_date')
        if due_date:
            queryset = queryset.filter(due_date=due_date)
        return queryset

    def perform_create(self, serializer):
        # Auto-attach the user when creating a new task
        serializer.save(user=self.request.user)
