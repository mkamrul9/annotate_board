from django.db import models
from django.contrib.auth.models import User

class AnnotationImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='annotations/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} uploaded by {self.user.username}"

class PolygonAnnotation(models.Model):
    image = models.ForeignKey(AnnotationImage, on_delete=models.CASCADE, related_name='polygons')
    # points will store an array of [x, y] percentage coordinates
    points = models.JSONField(default=list) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Polygon on Image {self.image.id}"
