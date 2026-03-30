from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.masters.models import Institution, Campus, Department, Program, AcademicYear, Quota, ProgramQuota

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@edumerge.com',
                password='admin123',
                role='Admin'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user (admin/admin123)'))

        if not User.objects.filter(username='officer').exists():
            User.objects.create_user(
                username='officer',
                email='officer@edumerge.com',
                password='officer123',
                role='AdmissionOfficer',
                first_name='Admission',
                last_name='Officer'
            )
            self.stdout.write(self.style.SUCCESS('Created admission officer user (officer/officer123)'))

        if not User.objects.filter(username='management').exists():
            User.objects.create_user(
                username='management',
                email='management@edumerge.com',
                password='management123',
                role='Management',
                first_name='Management',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('Created management user (management/management123)'))

        # Create institution
        institution, created = Institution.objects.get_or_create(
            code='INST',
            defaults={'name': 'Example Institution'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created institution: {institution.name}'))

        # Create campus
        campus, created = Campus.objects.get_or_create(
            institution=institution,
            code='MAIN',
            defaults={'name': 'Main Campus'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created campus: {campus.name}'))

        # Create departments
        departments_data = [
            {'code': 'CSE', 'name': 'Computer Science & Engineering'},
            {'code': 'ECE', 'name': 'Electronics & Communication Engineering'},
            {'code': 'MEC', 'name': 'Mechanical Engineering'},
        ]

        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                campus=campus,
                code=dept_data['code'],
                defaults={'name': dept_data['name']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created department: {dept.name}'))

        # Create programs
        programs_data = [
            {'department_code': 'CSE', 'code': 'CSE-UG', 'name': 'B.Tech Computer Science', 'course_type': 'UG', 'entry_type': 'Regular', 'intake': 120},
            {'department_code': 'CSE', 'code': 'CSE-LAT', 'name': 'B.Tech Computer Science (Lateral)', 'course_type': 'UG', 'entry_type': 'Lateral', 'intake': 30},
            {'department_code': 'ECE', 'code': 'ECE-UG', 'name': 'B.Tech Electronics', 'course_type': 'UG', 'entry_type': 'Regular', 'intake': 60},
            {'department_code': 'MEC', 'code': 'MEC-UG', 'name': 'B.Tech Mechanical', 'course_type': 'UG', 'entry_type': 'Regular', 'intake': 60},
        ]

        for prog_data in programs_data:
            dept = Department.objects.get(campus=campus, code=prog_data['department_code'])
            prog, created = Program.objects.get_or_create(
                department=dept,
                code=prog_data['code'],
                defaults={
                    'name': prog_data['name'],
                    'course_type': prog_data['course_type'],
                    'entry_type': prog_data['entry_type'],
                    'total_intake': prog_data['intake']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created program: {prog.name}'))

        # Create academic years
        academic_years_data = ['2024-2025', '2025-2026', '2026-2027']
        for year in academic_years_data:
            ay, created = AcademicYear.objects.get_or_create(
                year=year,
                defaults={'is_active': year == '2025-2026'}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created academic year: {ay.year}'))

        # Create quotas
        quotas_data = [
            {'code': 'KCET', 'name': 'KCET'},
            {'code': 'COMEDK', 'name': 'COMED-K'},
            {'code': 'MGMT', 'name': 'Management'},
        ]

        for quota_data in quotas_data:
            quota, created = Quota.objects.get_or_create(
                code=quota_data['code'],
                defaults={'name': quota_data['name']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created quota: {quota.name}'))

        # Create program quotas (sample allocation)
        cse_ug = Program.objects.filter(code='CSE-UG').first()
        if cse_ug and not ProgramQuota.objects.filter(program=cse_ug).exists():
            quotas = {
                'KCET': Quota.objects.get(code='KCET'),
                'COMEDK': Quota.objects.get(code='COMEDK'),
                'MGMT': Quota.objects.get(code='MGMT'),
            }
            ProgramQuota.objects.create(program=cse_ug, quota=quotas['KCET'], seats_allocated=60)
            ProgramQuota.objects.create(program=cse_ug, quota=quotas['COMEDK'], seats_allocated=40)
            ProgramQuota.objects.create(program=cse_ug, quota=quotas['MGMT'], seats_allocated=20)
            self.stdout.write(self.style.SUCCESS(f'Created program quotas for {cse_ug.name}'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))