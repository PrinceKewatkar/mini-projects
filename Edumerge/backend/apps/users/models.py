from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('AdmissionOfficer', 'Admission Officer'),
        ('Management', 'Management'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='AdmissionOfficer')

    class Meta:
        db_table = 'users'

    def is_admin(self):
        return self.role == 'Admin'

    def is_admission_officer(self):
        return self.role == 'AdmissionOfficer'

    def is_management(self):
        return self.role == 'Management'