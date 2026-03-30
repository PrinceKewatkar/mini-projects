from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from apps.masters.models import ProgramQuota
from .models import Applicant, Admission
from .serializers import (
    ApplicantSerializer, ApplicantCreateSerializer,
    AdmissionSerializer, AdmissionCreateSerializer,
    AdmissionConfirmSerializer, FeeUpdateSerializer
)


class IsAdminOrAdmissionOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['Admin', 'AdmissionOfficer']


class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ApplicantCreateSerializer
        return ApplicantSerializer

    def get_queryset(self):
        queryset = Applicant.objects.all()
        document_status = self.request.query_params.get('document_status')
        if document_status:
            queryset = queryset.filter(document_status=document_status)
        return queryset

    @action(detail=True, methods=['patch'])
    def verify_documents(self, request, pk=None):
        if request.user.role not in ['Admin', 'AdmissionOfficer']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        applicant = self.get_object()
        applicant.document_status = 'Verified'
        applicant.save()
        return Response(ApplicantSerializer(applicant).data)

    @action(detail=True, methods=['patch'])
    def submit_documents(self, request, pk=None):
        applicant = self.get_object()
        applicant.document_status = 'Submitted'
        applicant.save()
        return Response(ApplicantSerializer(applicant).data)


class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.select_related(
        'applicant', 'program__department__campus__institution', 'quota', 'academic_year'
    ).all()
    serializer_class = AdmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Admission.objects.select_related(
            'applicant', 'program__department__campus__institution', 'quota', 'academic_year'
        ).all()

        admission_status = self.request.query_params.get('admission_status')
        if admission_status:
            queryset = queryset.filter(admission_status=admission_status)

        fee_status = self.request.query_params.get('fee_status')
        if fee_status:
            queryset = queryset.filter(fee_status=fee_status)

        program_id = self.request.query_params.get('program')
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        return queryset

    @action(detail=False, methods=['post'])
    def allocate(self, request):
        if request.user.role not in ['Admin', 'AdmissionOfficer']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AdmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        program = serializer.validated_data['program']
        quota = serializer.validated_data['quota']
        academic_year = serializer.validated_data['academic_year']
        applicant = serializer.validated_data['applicant']
        allotment_number = serializer.validated_data.get('allotment_number', '')

        try:
            program_quota = ProgramQuota.objects.get(program=program, quota=quota)
        except ProgramQuota.DoesNotExist:
            return Response(
                {'error': f'No quota configuration found for {quota.name} in {program.name}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        admitted_count = Admission.objects.filter(
            program=program,
            quota=quota,
            academic_year=academic_year,
            admission_status__in=['Pending', 'Confirmed']
        ).count()

        if admitted_count >= program_quota.seats_allocated:
            return Response(
                {'error': f'No seats available in {quota.name} quota for {program.name}. '
                         f'Total: {program_quota.seats_allocated}, Allocated: {admitted_count}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        admission = Admission.objects.create(
            applicant=applicant,
            program=program,
            quota=quota,
            academic_year=academic_year,
            allotment_number=allotment_number,
            admission_status='Pending',
            fee_status='Pending'
        )

        return Response(AdmissionSerializer(admission).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        if request.user.role not in ['Admin', 'AdmissionOfficer']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        admission = self.get_object()

        if admission.admission_status == 'Confirmed':
            return Response(
                {'error': 'Admission already confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if admission.applicant.document_status != 'Verified':
            return Response(
                {'error': 'Documents must be verified before confirming admission'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if admission.fee_status != 'Paid':
            return Response(
                {'error': 'Fee must be paid before confirming admission'},
                status=status.HTTP_400_BAD_REQUEST
            )

        admission.admission_status = 'Confirmed'
        admission.generate_admission_number()
        admission.save()

        return Response(AdmissionSerializer(admission).data)

    @action(detail=True, methods=['patch'])
    def update_fee(self, request, pk=None):
        if request.user.role not in ['Admin', 'AdmissionOfficer']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        admission = self.get_object()
        serializer = FeeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        admission.fee_status = serializer.validated_data['fee_status']
        admission.save()

        return Response(AdmissionSerializer(admission).data)

    @action(detail=False, methods=['get'])
    def available_seats(self, request):
        program_id = request.query_params.get('program')
        quota_id = request.query_params.get('quota')
        academic_year_id = request.query_params.get('academic_year')

        if not all([program_id, quota_id, academic_year_id]):
            return Response(
                {'error': 'program, quota, and academic_year are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            program_quota = ProgramQuota.objects.get(
                program_id=program_id,
                quota_id=quota_id
            )
        except ProgramQuota.DoesNotExist:
            return Response({'available': 0})

        admitted_count = Admission.objects.filter(
            program_id=program_id,
            quota_id=quota_id,
            academic_year_id=academic_year_id,
            admission_status__in=['Pending', 'Confirmed']
        ).count()

        available = program_quota.seats_allocated - admitted_count

        return Response({
            'total': program_quota.seats_allocated,
            'allocated': admitted_count,
            'available': max(0, available)
        })