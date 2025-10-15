# api/views.py
import os
import json
import vertexai
import assemblyai as aai
from vertexai.generative_models import GenerativeModel, Part
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ReadingTask, SpeakingTask, User
from .serializers import UserSerializer, ReadingTaskSerializer, SpeakingTaskSerializer

# --- Auth Views (No Changes) ---
class RegisterView(generics.CreateAPIView): # ... same as before
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class LoginView(generics.GenericAPIView): # ... same as before
    permission_classes = (AllowAny,)
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({'refresh': str(refresh), 'access': str(refresh.access_token), 'user': {'id': user.id, 'username': user.username}})
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# --- Task Topic List Views (No Changes) ---
class ReadingTaskListView(generics.ListAPIView):
    queryset = ReadingTask.objects.all()
    serializer_class = ReadingTaskSerializer
    permission_classes = [IsAuthenticated]

class SpeakingTaskListView(generics.ListAPIView):
    queryset = SpeakingTask.objects.all()
    serializer_class = SpeakingTaskSerializer
    permission_classes = [IsAuthenticated]


# --- NEW DYNAMIC GENERATION VIEWS ---
class GenerateReadingTaskView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        try:
            task_topic = ReadingTask.objects.get(pk=pk).title
            vertexai.init(project=os.environ.get('GCP_PROJECT_ID'), location="us-central1")
            model = GenerativeModel("gemini-1.5-flash-001")
            
            prompt = f"""
            You are a content creator for the TOEFL exam. Your task is to generate a complete reading test based on a given topic.

            Topic: "{task_topic}"

            Instructions:
            1.  Generate a 500-600 word academic passage about the topic. The passage should be well-structured with clear paragraphs and suitable for a university-level reading test.
            2.  Based ONLY on the passage you just generated, create 10 multiple-choice questions that test reading comprehension, vocabulary in context, and inference.
            3.  For each question, provide four options labeled "A", "B", "C", and "D".
            4.  One option must be clearly the correct answer based on the passage. The other three should be plausible but incorrect distractors.
            5.  Return the entire output as a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON object.

            The JSON object must have the following structure:
            {{
              "title": "{task_topic}",
              "passage": "The full text of the generated passage...",
              "questions": [
                {{
                  "id": 1,
                  "question_text": "The first question text...",
                  "options": {{
                    "A": "Option A text...",
                    "B": "Option B text...",
                    "C": "Option C text...",
                    "D": "Option D text..."
                  }},
                  "correct_answer_key": "C"
                }},
                ... (9 more question objects)
              ]
            }}
            """
            response = model.generate_content(prompt)
            # Clean the response to ensure it's valid JSON
            cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
            json_data = json.loads(cleaned_response_text)
            return Response(json_data)

        except ReadingTask.DoesNotExist:
            return Response({'error': 'Task topic not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f"Failed to generate task: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GenerateSpeakingTaskView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        try:
            task = SpeakingTask.objects.get(pk=pk)
            vertexai.init(project=os.environ.get('GCP_PROJECT_ID'), location="us-central1")
            model = GenerativeModel("gemini-1.5-flash-001")
            prompt = f"""
            You are a TOEFL content creator. Based on the theme '{task.topic_theme}', generate a single, specific speaking prompt suitable for a TOEFL Independent Speaking task.
            The prompt should ask the user to state an opinion, describe something, or compare two things, and require them to use personal examples.
            Return the output as a single JSON object with the key "topic". Example: {{"topic": "Your generated question here."}}
            """
            response = model.generate_content(prompt)
            cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
            json_data = json.loads(cleaned_response_text)
            return Response(json_data)
        except SpeakingTask.DoesNotExist:
            return Response({'error': 'Task theme not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f"Failed to generate task: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- UPDATED SUBMISSION VIEWS ---
class SubmitReadingView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        # This view no longer needs a task 'pk'
        user_answers = request.data.get('userAnswers', {})
        correct_answers = request.data.get('correctAnswers', {})
        score = 0
        
        for q_id, correct_key in correct_answers.items():
            if user_answers.get(q_id) == correct_key:
                score += 1
        
        return Response({'score': score, 'total': len(correct_answers)})

class SubmitSpeakingView(views.APIView): # ... same as before
    permission_classes = [IsAuthenticated]
    def post(self, request, pk, *args, **kwargs):
        # This view doesn't need changes as evaluation is separate from generation
        # It still needs the 'pk' to get the original topic for the prompt context
        # The logic using AssemblyAI and VertexAI for evaluation is IDENTICAL to the previous step
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            task = SpeakingTask.objects.get(pk=pk)
            aai.settings.api_key = os.environ.get("ASSEMBLYAI_API_KEY")
            transcriber = aai.Transcriber()
            transcript = transcriber.transcribe(audio_file)

            if transcript.status == aai.TranscriptStatus.error: return Response({'error': transcript.error}, status=status.HTTP_400_BAD_REQUEST)
            if not transcript.text: return Response({'error': 'Could not transcribe audio.'}, status=status.HTTP_400_BAD_REQUEST)
            
            vertexai.init(project=os.environ.get('GCP_PROJECT_ID'), location="us-central1")
            model = GenerativeModel("gemini-1.5-flash-001")
            prompt = f"""You are a TOEFL speaking evaluator... The speaking theme was: "{task.topic_theme}"... The user's transcribed response is: "{transcript.text}" ..."""
            
            ai_response = model.generate_content(prompt)
            feedback = ai_response.text
            score_line = [line for line in feedback.split('\n') if "Overall Score:" in line]
            score = score_line[0].split(':')[1].strip().split('/')[0] if score_line else "N/A"

            return Response({'feedback': feedback, 'score': score, 'transcript': transcript.text})
        except SpeakingTask.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)