from django.db import models
from rest_framework import serializers
from .models import Institution, Campus, Department, Program, AcademicYear, Quota, ProgramQuota


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'


class CampusSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = Campus
        fields = ['id', 'institution', 'institution_name', 'name', 'code']


class DepartmentSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    institution_name = serializers.CharField(source='campus.institution.name', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'campus', 'campus_name', 'institution_name', 'name', 'code']


class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    campus_name = serializers.CharField(source='department.campus.name', read_only=True)
    institution_name = serializers.CharField(source='department.campus.institution.name', read_only=True)
    course_type_display = serializers.CharField(source='get_course_type_display', read_only=True)
    entry_type_display = serializers.CharField(source='get_entry_type_display', read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'department', 'department_name', 'campus_name', 'institution_name',
            'name', 'code', 'course_type', 'course_type_display',
            'entry_type', 'entry_type_display', 'total_intake'
        ]


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'


class QuotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quota
        fields = '__all__'


class ProgramQuotaSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    quota_name = serializers.CharField(source='quota.name', read_only=True)
    program_code = serializers.CharField(source='program.code', read_only=True)

    class Meta:
        model = ProgramQuota
        fields = ['id', 'program', 'program_name', 'program_code', 'quota', 'quota_name', 'seats_allocated']

    def validate(self, data):
        program = data.get('program')
        seats_allocated = data.get('seats_allocated', 0)

        if program:
            existing_seats = ProgramQuota.objects.filter(
                program=program
            ).exclude(pk=self.instance.pk if self.instance else None).aggregate(
                total=models.Sum('seats_allocated')
            )['total'] or 0

            if existing_seats + seats_allocated > program.total_intake:
                raise serializers.ValidationError(
                    f"Total quota seats ({existing_seats + seats_allocated}) "
                    f"exceeds program intake ({program.total_intake})"
                )

        return data


class ProgramQuotaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramQuota
        fields = ['id', 'program', 'quota', 'seats_allocated']

    def validate(self, data):
        program = data.get('program')
        seats_allocated = data.get('seats_allocated', 0)

        if program:
            existing_seats = ProgramQuota.objects.filter(
                program=program
            ).exclude(pk=self.instance.pk if self.instance else None).aggregate(
                total=models.Sum('seats_allocated')
            )['total'] or 0

            if existing_seats + seats_allocated > program.total_intake:
                raise serializers.ValidationError(
                    f"Total quota seats ({existing_seats + seats_allocated}) "
                    f"exceeds program intake ({program.total_intake})"
                )

        return data