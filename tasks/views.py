from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from annotations.models import AnnotationImage
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return tasks for the authenticated user only.
        Uses select_related to avoid N+1 queries when serializing annotation_image.
        """
        queryset = Task.objects.filter(user=self.request.user).select_related(
            'annotation_image'
        )
        due_date = self.request.query_params.get('due_date')
        if due_date:
            queryset = queryset.filter(due_date=due_date)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Return aggregate statistics for the current user."""
        user_tasks = Task.objects.filter(user=request.user)
        total_tasks = user_tasks.count()
        completed_tasks = user_tasks.filter(status=Task.Status.DONE).count()
        annotated_scans = AnnotationImage.objects.filter(user=request.user).count()

        return Response({
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "annotated_scans": annotated_scans,
        })
