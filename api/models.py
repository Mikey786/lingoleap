# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)

# The ReadingQuestion model has been REMOVED.

class ReadingTask(models.Model):
    # This now only stores the high-level topic for generation.
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class SpeakingTask(models.Model):
    # This model remains useful as is.
    title = models.CharField(max_length=255)
    # This field can serve as the theme for generation.
    topic_theme = models.CharField(max_length=255) 

    def __str__(self):
        return self.title