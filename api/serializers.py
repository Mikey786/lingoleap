# api/serializers.py
from rest_framework import serializers
from .models import User, ReadingTask, SpeakingTask # ReadingQuestion is no longer imported
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User registration and authentication. No changes needed here.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class ReadingTaskSerializer(serializers.ModelSerializer):
    """
    This serializer is now only used to list the available reading TOPICS.
    It only needs to send the ID and title.
    """
    class Meta:
        model = ReadingTask
        fields = ['id', 'title']

class SpeakingTaskSerializer(serializers.ModelSerializer):
    """
    This serializer is now only used to list the available speaking TOPICS/THEMES.
    It only needs to send the ID and title.
    """
    class Meta:
        model = SpeakingTask
        fields = ['id', 'title']

# NOTE: The ReadingQuestionSerializer and ReadingTaskDetailSerializer have been
# removed because they are no longer needed. The AI generates the details dynamically.