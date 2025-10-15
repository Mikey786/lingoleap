# api/management/commands/seed_data.py
from django.core.management.base import BaseCommand
from api.models import ReadingTask, SpeakingTask

class Command(BaseCommand):
    help = 'Seeds the database with initial TOEFL task TOPICS for dynamic generation.'

    def handle(self, *args, **options):
        self.stdout.write('Deleting old task topics...')
        ReadingTask.objects.all().delete()
        SpeakingTask.objects.all().delete()

        self.stdout.write('Creating new task topics...')
        
        # --- Create Speaking Task Themes ---
        SpeakingTask.objects.create(title="Technology in Daily Life", topic_theme="The impact of a specific technology on personal life.")
        SpeakingTask.objects.create(title="Education and Learning", topic_theme="Comparing traditional learning methods with modern ones.")
        SpeakingTask.objects.create(title="Environmental Issues", topic_theme="A personal opinion on a local environmental problem and its potential solutions.")
        SpeakingTask.objects.create(title="Social Trends", topic_theme="The pros and cons of social media on friendships.")
        SpeakingTask.objects.create(title="Work and Career", topic_theme="The qualities of a good manager or colleague.")
        SpeakingTask.objects.create(title="Culture and Travel", topic_theme="The benefits of traveling to a foreign country.")

        # --- Create Reading Task Topics ---
        ReadingTask.objects.create(title="The Cambrian Explosion")
        ReadingTask.objects.create(title="The Decline of the Roman Empire")
        ReadingTask.objects.create(title="The Psychology of Memory")
        ReadingTask.objects.create(title="Plate Tectonics and Continental Drift")
        ReadingTask.objects.create(title="The Development of Renaissance Art")
        ReadingTask.objects.create(title="Photosynthesis and Plant Metabolism")

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database with task topics.'))