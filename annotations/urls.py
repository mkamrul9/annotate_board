from rest_framework.routers import DefaultRouter
from .views import AnnotationImageViewSet, PolygonAnnotationViewSet

router = DefaultRouter()
router.register(r'images', AnnotationImageViewSet, basename='image')
router.register(r'polygons', PolygonAnnotationViewSet, basename='polygon')

urlpatterns = router.urls
