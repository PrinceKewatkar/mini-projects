from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InstitutionViewSet, CampusViewSet, DepartmentViewSet,
    ProgramViewSet, AcademicYearViewSet, QuotaViewSet, ProgramQuotaViewSet
)

router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'campuses', CampusViewSet, basename='campus')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'academic-years', AcademicYearViewSet, basename='academic-year')
router.register(r'quotas', QuotaViewSet, basename='quota')
router.register(r'program-quotas', ProgramQuotaViewSet, basename='program-quota')

urlpatterns = [
    path('', include(router.urls)),
]