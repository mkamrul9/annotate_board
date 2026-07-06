from django.contrib import admin
from .models import AnnotationImage, PolygonAnnotation

@admin.register(AnnotationImage)
class AnnotationImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'uploaded_at')

@admin.register(PolygonAnnotation)
class PolygonAnnotationAdmin(admin.ModelAdmin):
    list_display = ('id', 'image', 'created_at')
