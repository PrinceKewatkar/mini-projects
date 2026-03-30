from django.db import models
from apps.masters.models import Program, Quota, AcademicYear


class Applicant(models.Model):
    CATEGORY_CHOICES = [
        ('GM', 'General Merit'),
        ('SC', 'Scheduled Caste'),
        ('ST', 'Scheduled Tribe'),
        ('OBC', 'Other Backward Class'),
        ('EWS', 'Economically Weaker Section'),
        ('CAT-1', 'Category 1'),
        ('2A', '2A'),
        ('2B', '2B'),
        ('3A', '3A'),
        ('3B', '3B'),
    ]

    ENTRY_TYPE_CHOICES = [
        ('Regular', 'Regular'),
        ('Lateral', 'Lateral'),
    ]

    DOCUMENT_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Submitted', 'Submitted'),
        ('Verified', 'Verified'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPE_CHOICES)
    qualifying_exam = models.CharField(max_length=100)
    qualifying_exam_marks = models.DecimalField(max_digits=5, decimal_places=2)
    document_status = models.CharField(max_length=10, choices=DOCUMENT_STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applicants'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Admission(models.Model):
    ADMISSION_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    ]

    FEE_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
    ]

    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='admissions')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='admissions')
    quota = models.ForeignKey(Quota, on_delete=models.CASCADE, related_name='admissions')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='admissions')
    allotment_number = models.CharField(max_length=50, blank=True, null=True)
    admission_number = models.CharField(max_length=100, unique=True, blank=True, null=True)
    admission_status = models.CharField(max_length=10, choices=ADMISSION_STATUS_CHOICES, default='Pending')
    fee_status = models.CharField(max_length=10, choices=FEE_STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admissions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.applicant.full_name} - {self.program.name}"

    def generate_admission_number(self):
        if self.admission_number:
            return self.admission_number

        institution = self.program.department.campus.institution
        year = self.academic_year.year.split('-')[0]
        course_type = self.program.course_type
        program_code = self.program.code
        quota_code = self.quota.code

        sequence = Admission.objects.filter(
            program=self.program,
            quota=self.quota,
            academic_year=self.academic_year,
            admission_number__isnull=False
        ).count() + 1

        self.admission_number = f"{institution.code}/{year}/{course_type}/{program_code}/{quota_code}/{sequence:04d}"
        self.save()
        return self.admission_number