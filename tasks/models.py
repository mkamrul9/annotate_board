from django.db import models
from django.contrib.auth.models import User
from annotations.models import AnnotationImage

class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DONE = 'DONE', 'Done'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    due_date = models.DateField()
    tags = models.JSONField(default=list, blank=True) # Stores tags like ["urgent", "frontend"]
    
    # Link to the annotation image (nullable so not all tasks need an image)
    annotation_image = models.ForeignKey(
        AnnotationImage, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='linked_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.due_date}"
