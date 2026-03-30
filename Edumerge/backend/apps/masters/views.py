from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Institution, Campus, Department, Program, AcademicYear, Quota, ProgramQuota
from .serializers import (
    InstitutionSerializer, CampusSerializer, DepartmentSerializer,
    ProgramSerializer, AcademicYearSerializer, QuotaSerializer,
    ProgramQuotaSerializer, ProgramQuotaCreateSerializer
)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Admin'


class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


class CampusViewSet(viewsets.ModelViewSet):
    queryset = Campus.objects.select_related('institution').all()
    serializer_class = CampusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Campus.objects.select_related('institution').all()
        institution_id = self.request.query_params.get('institution')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        return queryset


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.select_related('campus__institution').all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Department.objects.select_related('campus__institution').all()
        campus_id = self.request.query_params.get('campus')
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.select_related('department__campus__institution').all()
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Program.objects.select_related('department__campus__institution').all()
        department_id = self.request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        institution_id = self.request.query_params.get('institution')
        if institution_id:
            queryset = queryset.filter(department__campus__institution_id=institution_id)
        return queryset

    @action(detail=True, methods=['get'])
    def quota_summary(self, request, pk=None):
        program = self.get_object()
        quotas = ProgramQuota.objects.filter(program=program)
        serializer = ProgramQuotaSerializer(quotas, many=True)
        return Response(serializer.data)


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


class QuotaViewSet(viewsets.ModelViewSet):
    queryset = Quota.objects.all()
    serializer_class = QuotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


class ProgramQuotaViewSet(viewsets.ModelViewSet):
    queryset = ProgramQuota.objects.select_related('program', 'quota').all()
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProgramQuotaCreateSerializer
        return ProgramQuotaSerializer

    def get_queryset(self):
        queryset = ProgramQuota.objects.select_related('program', 'quota').all()
        program_id = self.request.query_params.get('program')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset