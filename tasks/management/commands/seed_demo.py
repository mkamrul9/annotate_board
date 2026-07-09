"""
Management command: seed_demo
Creates a demo user and seeds 10 realistic tasks across all Kanban columns.
Usage: python manage.py seed_demo
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from tasks.models import Task
import json
from datetime import date, timedelta


DEMO_USERNAME = 'demo'
DEMO_PASSWORD = 'Demo@1234'

SEED_TASKS = [
    {
        'title': 'Review chest X-ray batch — Patient cohort A',
        'status': 'TODO',
        'priority': 'HIGH',
        'tags': ['x-ray', 'urgent', 'cohort-a'],
        'due_date': str(date.today() + timedelta(days=2)),
    },
    {
        'title': 'Annotate pulmonary nodule segmentation masks',
        'status': 'TODO',
        'priority': 'HIGH',
        'tags': ['ct-scan', 'segmentation', 'nodule'],
        'due_date': str(date.today() + timedelta(days=3)),
    },
    {
        'title': 'Quality check exported COCO annotations',
        'status': 'TODO',
        'priority': 'MEDIUM',
        'tags': ['qa', 'coco', 'export'],
        'due_date': str(date.today() + timedelta(days=5)),
    },
    {
        'title': 'Label bounding boxes for liver CT dataset',
        'status': 'TODO',
        'priority': 'LOW',
        'tags': ['ct-scan', 'liver', 'bbox'],
        'due_date': str(date.today() + timedelta(days=7)),
    },
    {
        'title': 'Run YOLOv8 auto-annotation on MRI series',
        'status': 'IN_PROGRESS',
        'priority': 'HIGH',
        'tags': ['yolo', 'mri', 'auto-annotate'],
        'due_date': str(date.today() + timedelta(days=1)),
    },
    {
        'title': 'Validate polygon accuracy on brain scans',
        'status': 'IN_PROGRESS',
        'priority': 'MEDIUM',
        'tags': ['polygon', 'brain', 'validation'],
        'due_date': str(date.today() + timedelta(days=2)),
    },
    {
        'title': 'Export annotations for model training pipeline',
        'status': 'IN_PROGRESS',
        'priority': 'HIGH',
        'tags': ['export', 'training', 'pipeline'],
        'due_date': str(date.today() + timedelta(days=1)),
    },
    {
        'title': 'Annotate fracture detection dataset v1',
        'status': 'DONE',
        'priority': 'HIGH',
        'tags': ['fracture', 'x-ray', 'v1'],
        'due_date': str(date.today() - timedelta(days=3)),
    },
    {
        'title': 'Set up annotation guidelines for team',
        'status': 'DONE',
        'priority': 'MEDIUM',
        'tags': ['guidelines', 'team', 'documentation'],
        'due_date': str(date.today() - timedelta(days=5)),
    },
    {
        'title': 'Complete spine segmentation for research paper',
        'status': 'DONE',
        'priority': 'HIGH',
        'tags': ['spine', 'segmentation', 'research'],
        'due_date': str(date.today() - timedelta(days=2)),
    },
]


class Command(BaseCommand):
    help = 'Seed a demo user and realistic Kanban tasks into the database.'

    def handle(self, *args, **options):
        # Create or retrieve demo user
        user, created = User.objects.get_or_create(username=DEMO_USERNAME)
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created user: {DEMO_USERNAME}'))
        else:
            self.stdout.write(f'  User "{DEMO_USERNAME}" already exists — skipping creation.')

        # Ensure token exists
        Token.objects.get_or_create(user=user)

        # Seed tasks (only if user has none)
        existing = Task.objects.filter(user=user).count()
        if existing > 0:
            self.stdout.write(f'  User already has {existing} tasks — skipping seed.')
        else:
            for task_data in SEED_TASKS:
                Task.objects.create(
                    user=user,
                    title=task_data['title'],
                    status=task_data['status'],
                    priority=task_data['priority'],
                    tags=task_data['tags'],
                    due_date=task_data['due_date'],
                    subtasks=[],
                )
            self.stdout.write(self.style.SUCCESS(f'✓ Seeded {len(SEED_TASKS)} tasks for "{DEMO_USERNAME}".'))

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Done! Demo credentials:\n'
            f'   Username: {DEMO_USERNAME}\n'
            f'   Password: {DEMO_PASSWORD}\n'
        ))
