from django.contrib import admin
from .models import Institution, Campus, Department, Program, AcademicYear, Quota, ProgramQuota


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'institution']
    list_filter = ['institution']
    search_fields = ['name', 'code']


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'campus']
    list_filter = ['campus', 'campus__institution']
    search_fields = ['name', 'code']


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'department', 'course_type', 'entry_type', 'total_intake']
    list_filter = ['course_type', 'entry_type', 'department__campus__institution']
    search_fields = ['name', 'code']


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['year', 'is_active']
    list_filter = ['is_active']


@admin.register(Quota)
class QuotaAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']


@admin.register(ProgramQuota)
class ProgramQuotaAdmin(admin.ModelAdmin):
    list_display = ['program', 'quota', 'seats_allocated']
    list_filter = ['quota', 'program__department__campus__institution']
    search_fields = ['program__name', 'quota__name']