from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from apps.masters.models import Program, ProgramQuota
from apps.admissions.models import Applicant, Admission


class SeatStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        programs = Program.objects.prefetch_related('program_quotas', 'admissions').all()

        data = []
        for program in programs:
            total_intake = program.total_intake
            admitted = program.admissions.filter(admission_status='Confirmed').count()
            pending = program.admissions.filter(admission_status='Pending').count()

            data.append({
                'program_id': program.id,
                'program_name': program.name,
                'program_code': program.code,
                'total_intake': total_intake,
                'admitted': admitted,
                'pending': pending,
                'remaining': total_intake - admitted - pending
            })

        totals = {
            'total_intake': sum(p['total_intake'] for p in data),
            'admitted': sum(p['admitted'] for p in data),
            'pending': sum(p['pending'] for p in data),
            'remaining': sum(p['remaining'] for p in data)
        }

        return Response({
            'programs': data,
            'totals': totals
        })


class QuotaStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        program_id = request.query_params.get('program')

        if program_id:
            program_quotas = ProgramQuota.objects.filter(program_id=program_id).select_related('program', 'quota')
        else:
            program_quotas = ProgramQuota.objects.select_related('program', 'quota').all()

        data = []
        for pq in program_quotas:
            admitted = Admission.objects.filter(
                program=pq.program,
                quota=pq.quota,
                admission_status='Confirmed'
            ).count()

            pending = Admission.objects.filter(
                program=pq.program,
                quota=pq.quota,
                admission_status='Pending'
            ).count()

            data.append({
                'program_id': pq.program.id,
                'program_name': pq.program.name,
                'quota_id': pq.quota.id,
                'quota_name': pq.quota.name,
                'total_seats': pq.seats_allocated,
                'admitted': admitted,
                'pending': pending,
                'available': pq.seats_allocated - admitted - pending
            })

        return Response(data)


class PendingDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applicants = Applicant.objects.filter(
            document_status__in=['Pending', 'Submitted']
        ).order_by('-created_at')

        data = []
        for applicant in applicants:
            data.append({
                'id': applicant.id,
                'name': applicant.full_name,
                'email': applicant.email,
                'phone': applicant.phone,
                'document_status': applicant.document_status,
                'created_at': applicant.created_at
            })

        return Response({
            'count': len(data),
            'applicants': data
        })


class PendingFeesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        admissions = Admission.objects.filter(
            fee_status='Pending'
        ).select_related('applicant', 'program', 'quota').order_by('-created_at')

        data = []
        for admission in admissions:
            data.append({
                'id': admission.id,
                'applicant_name': admission.applicant.full_name,
                'applicant_email': admission.applicant.email,
                'program_name': admission.program.name,
                'quota_name': admission.quota.name,
                'admission_status': admission.admission_status,
                'created_at': admission.created_at
            })

        return Response({
            'count': len(data),
            'admissions': data
        })


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_programs = Program.objects.count()
        total_applicants = Applicant.objects.count()
        total_admissions = Admission.objects.count()
        confirmed_admissions = Admission.objects.filter(admission_status='Confirmed').count()
        pending_admissions = Admission.objects.filter(admission_status='Pending').count()
        pending_documents = Applicant.objects.filter(document_status__in=['Pending', 'Submitted']).count()
        pending_fees = Admission.objects.filter(fee_status='Pending').count()

        total_intake = Program.objects.aggregate(total=Sum('total_intake'))['total'] or 0

        return Response({
            'total_programs': total_programs,
            'total_intake': total_intake,
            'total_applicants': total_applicants,
            'total_admissions': total_admissions,
            'confirmed_admissions': confirmed_admissions,
            'pending_admissions': pending_admissions,
            'pending_documents': pending_documents,
            'pending_fees': pending_fees
        })