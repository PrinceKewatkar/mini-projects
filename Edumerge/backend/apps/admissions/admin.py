from django.contrib import admin
from .models import Applicant, Admission


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'phone', 'category', 'entry_type', 'document_status']
    list_filter = ['category', 'entry_type', 'document_status']
    search_fields = ['first_name', 'last_name', 'email', 'phone']


@admin.register(Admission)
class AdmissionAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'program', 'quota', 'academic_year', 'admission_status', 'fee_status', 'admission_number']
    list_filter = ['admission_status', 'fee_status', 'quota', 'academic_year']
    search_fields = ['applicant__first_name', 'applicant__last_name', 'admission_number', 'allotment_number']