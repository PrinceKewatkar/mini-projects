from django.db import models


class Institution(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'institutions'
        ordering = ['name']

    def __str__(self):
        return self.name


class Campus(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='campuses')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)

    class Meta:
        db_table = 'campuses'
        ordering = ['name']
        unique_together = ['institution', 'code']

    def __str__(self):
        return self.name


class Department(models.Model):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)

    class Meta:
        db_table = 'departments'
        ordering = ['name']
        unique_together = ['campus', 'code']

    def __str__(self):
        return self.name


class Program(models.Model):
    COURSE_TYPE_CHOICES = [
        ('UG', 'Undergraduate'),
        ('PG', 'Postgraduate'),
    ]

    ENTRY_TYPE_CHOICES = [
        ('Regular', 'Regular'),
        ('Lateral', 'Lateral'),
    ]

    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    course_type = models.CharField(max_length=2, choices=COURSE_TYPE_CHOICES)
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPE_CHOICES)
    total_intake = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'programs'
        ordering = ['name']
        unique_together = ['department', 'code']

    def __str__(self):
        return self.name

    @property
    def institution(self):
        return self.department.campus.institution


class AcademicYear(models.Model):
    year = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'academic_years'
        ordering = ['-year']

    def __str__(self):
        return self.year


class Quota(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'quotas'
        ordering = ['name']

    def __str__(self):
        return self.name


class ProgramQuota(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='program_quotas')
    quota = models.ForeignKey(Quota, on_delete=models.CASCADE, related_name='program_quotas')
    seats_allocated = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'program_quotas'
        unique_together = ['program', 'quota']

    def __str__(self):
        return f"{self.program.name} - {self.quota.name} ({self.seats_allocated})"

    def clean(self):
        total_quota_seats = ProgramQuota.objects.filter(
            program=self.program
        ).exclude(pk=self.pk).aggregate(
            total=models.Sum('seats_allocated')
        )['total'] or 0

        if total_quota_seats + self.seats_allocated > self.program.total_intake:
            raise ValueError(
                f"Total quota seats ({total_quota_seats + self.seats_allocated}) "
                f"exceeds program intake ({self.program.total_intake})"
            )