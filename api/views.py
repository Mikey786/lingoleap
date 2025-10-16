import os
import json
import google.generativeai as genai
import assemblyai as aai
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ReadingTask, SpeakingTask, User
from .serializers import UserSerializer, ReadingTaskSerializer, SpeakingTaskSerializer

# --- Configure the Gemini API Key ---
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("--- GEMINI_API_KEY environment variable not found. ---")
    else:
        print(f"--- Gemini API Key loaded successfully. Key starts with: {api_key[:4]}... ---")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"An error occurred during Gemini configuration: {e}")


# --- Authentication Views (No Changes) ---

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class LoginView(generics.GenericAPIView):
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


# --- DYNAMIC GENERATION VIEWS (Using correct model name) ---

class GenerateReadingTaskView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        try:
            task_topic = ReadingTask.objects.get(pk=pk).title
            model = genai.GenerativeModel("gemini-2.5-flash") # <-- CHANGE HERE
            
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
            cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
            json_data = json.loads(cleaned_response_text)
            return Response(json_data)

        except ReadingTask.DoesNotExist:
            return Response({'error': 'Task topic not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"ERROR in GenerateReadingTaskView: {repr(e)}")
            return Response({'error': f"Failed to generate task: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GenerateSpeakingTaskView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        try:
            task = SpeakingTask.objects.get(pk=pk)
            model = genai.GenerativeModel("gemini-2.5-flash") # <-- CHANGE HERE
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
            print(f"ERROR in GenerateSpeakingTaskView: {repr(e)}")
            return Response({'error': f"Failed to generate task: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- SUBMISSION VIEWS ---

class SubmitReadingView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        user_answers = request.data.get('userAnswers', {})
        correct_answers = request.data.get('correctAnswers', {})
        score = 0
        
        for q_id, correct_key in correct_answers.items():
            if user_answers.get(q_id) == correct_key:
                score += 1
        
        return Response({'score': score, 'total': len(correct_answers)})

class SubmitSpeakingView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk, *args, **kwargs):
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            task = SpeakingTask.objects.get(pk=pk)
            aai.settings.api_key = os.environ.get("ASSEMBLYAI_API_KEY")
            transcriber = aai.Transcriber()
            transcript = transcriber.transcribe(audio_file)

            if transcript.status == aai.TranscriptStatus.error: 
                return Response({'error': transcript.error}, status=status.HTTP_400_BAD_REQUEST)
            if not transcript.text: 
                return Response({'error': 'Could not transcribe audio.'}, status=status.HTTP_400_BAD_REQUEST)
            
            model = genai.GenerativeModel("gemini-2.5-flash") # <-- CHANGE HERE
            prompt = f"""
            You are a TOEFL speaking evaluator. Your task is to provide feedback and a score for a user's response to a speaking prompt.

            The speaking theme was: "{task.topic_theme}"

            The user's transcribed response is:
            "{transcript.text}"

            Please provide feedback on the following criteria:
            1.  **Delivery:** Was the speech clear and fluent? Was the pace appropriate?
            2.  **Language Use:** How effectively was grammar and vocabulary used? Were there many errors?
            3.  **Topic Development:** How well was the topic addressed? Was the response coherent and well-supported with examples or details?

            Finally, provide an "Overall Score" on a scale from 0 to 4, where 4 is excellent. The score should be on its own line like this:
            Overall Score: [score]/4
            """
            
            ai_response = model.generate_content(prompt)
            feedback = ai_response.text
            
            score = "N/A"
            score_line = [line for line in feedback.split('\n') if "Overall Score:" in line]
            if score_line:
                score_str = score_line[0].split(':')[1].strip()
                score = score_str.split('/')[0].strip()

            return Response({'feedback': feedback, 'score': score, 'transcript': transcript.text})
        except SpeakingTask.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"ERROR in SubmitSpeakingView: {repr(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)