from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicantViewSet, AdmissionViewSet

router = DefaultRouter()
router.register(r'applicants', ApplicantViewSet, basename='applicant')
router.register(r'admissions', AdmissionViewSet, basename='admission')

urlpatterns = [
    path('', include(router.urls)),
]