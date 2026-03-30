from rest_framework import serializers
from .models import Applicant, Admission


class ApplicantSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    entry_type_display = serializers.CharField(source='get_entry_type_display', read_only=True)
    document_status_display = serializers.CharField(source='get_document_status_display', read_only=True)

    class Meta:
        model = Applicant
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'date_of_birth', 'gender', 'category', 'category_display',
            'entry_type', 'entry_type_display', 'qualifying_exam', 'qualifying_exam_marks',
            'document_status', 'document_status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ApplicantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone',
            'date_of_birth', 'gender', 'category', 'entry_type',
            'qualifying_exam', 'qualifying_exam_marks', 'document_status'
        ]


class AdmissionSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.full_name', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_code = serializers.CharField(source='program.code', read_only=True)
    quota_name = serializers.CharField(source='quota.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)
    institution_name = serializers.CharField(source='program.department.campus.institution.name', read_only=True)
    admission_status_display = serializers.CharField(source='get_admission_status_display', read_only=True)
    fee_status_display = serializers.CharField(source='get_fee_status_display', read_only=True)

    class Meta:
        model = Admission
        fields = [
            'id', 'applicant', 'applicant_name', 'applicant_email',
            'program', 'program_name', 'program_code',
            'quota', 'quota_name', 'academic_year', 'academic_year_name',
            'institution_name', 'allotment_number', 'admission_number',
            'admission_status', 'admission_status_display',
            'fee_status', 'fee_status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'admission_number', 'created_at', 'updated_at']


class AdmissionCreateSerializer(serializers.Serializer):
    applicant = serializers.PrimaryKeyRelatedField(queryset=Applicant.objects.all())
    program = serializers.PrimaryKeyRelatedField(queryset=Admission._meta.get_field('program').related_model.objects.all())
    quota = serializers.PrimaryKeyRelatedField(queryset=Admission._meta.get_field('quota').related_model.objects.all())
    academic_year = serializers.PrimaryKeyRelatedField(queryset=Admission._meta.get_field('academic_year').related_model.objects.all())
    allotment_number = serializers.CharField(required=False, allow_blank=True)


class AdmissionConfirmSerializer(serializers.Serializer):
    pass


class FeeUpdateSerializer(serializers.Serializer):
    fee_status = serializers.ChoiceField(choices=['Pending', 'Paid'])