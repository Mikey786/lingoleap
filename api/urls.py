# api/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    
    # Get lists of task topics
    path('tasks/reading/', ReadingTaskListView.as_view()),
    path('tasks/speaking/', SpeakingTaskListView.as_view()),
    
    # NEW: Generate dynamic task content
    path('generate/reading/<int:pk>/', GenerateReadingTaskView.as_view()),
    path('generate/speaking/<int:pk>/', GenerateSpeakingTaskView.as_view()),
    
    # Submissions
    path('submit/reading/', SubmitReadingView.as_view()), # No longer needs PK
    path('submit/speaking/<int:pk>/', SubmitSpeakingView.as_view()),
]