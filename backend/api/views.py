from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, update_session_auth_hash
from .models import Enseignant, HelpRequest, Presence
from .serializers import EnseignantSerializer, EnseignantLoginSerializer, SessionSerializer,PasswordSerializer, EmailSerializer, HelpRequestSerializer, PresenceSerializer
import qrcode
from django.core.files import File
from io import BytesIO
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from datetime import datetime

class EnseignantSignupView(generics.CreateAPIView):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            return Response(
                {
                    "message": "Compte créé avec succès - En attente de validation admin",
                    "token": token.key,
                    "statut": user.statut
                },
                status=status.HTTP_201_CREATED
            )
        except serializers.ValidationError as e:
            print("Serializer errors:", serializer.errors)
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
class EnseignantLoginView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        serializer = EnseignantLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            login(request, user)
            
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Connexion réussie",
                "token": token.key,
                "statut": user.statut
            })
        return Response(serializer.errors, status=400)
    
    
class GenerateQRCodeAPI(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Verify user is an Enseignant
        if not hasattr(request.user, 'statut'):
            return Response({"error": "Only teachers can generate QR codes"}, status=403)

        serializer = SessionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Create session with teacher
                session = serializer.save(enseignant=request.user)
                
                # Generate QR code
                qr_data = f"session:{session.id}"
                qr_img = qrcode.make(qr_data)
                
                # Save QR image
                buffer = BytesIO()
                qr_img.save(buffer, format="PNG")
                session.qr_code.save(f"qr_{session.id}.png", File(buffer))
                session.save()
                
                return Response({
                    "success": True,
                    "qr_code_url": request.build_absolute_uri(session.qr_code.url),
                    "session_id": session.id
                })
                
            except Exception as e:
                return Response({"error": str(e)}, status=500)
                
        return Response({"errors": serializer.errors}, status=400)
    
    

            
class ProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    # Get current email
    def get(self, request):
        return Response({'email': request.user.email})

    # Update email
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            request.user.email = serializer.validated_data['email']
            request.user.save()
            return Response({'status': 'Email updated'})
        return Response(serializer.errors, status=400)

class PasswordAPI(APIView):
    permission_classes = [IsAuthenticated]

    # Update password
    def post(self, request):
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Wrong current password'}, status=400)
            
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            update_session_auth_hash(request, request.user)  # Prevent logout
            return Response({'status': 'Password updated'})
        return Response(serializer.errors, status=400)
    
    
class HelpRequestAPI(APIView):
    def post(self, request):
        serializer = HelpRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "Message sent successfully!"})
        return Response(serializer.errors, status=400)
    
    
    
@api_view(['GET'])
def get_absences(request):
    session_id = request.GET.get('session')
    niveau = request.GET.get('niveau')
    date_str = request.GET.get('date')

    presences = Presence.objects.select_related('etudiant', 'session').all()

    if session_id:
        presences = presences.filter(session__id=session_id)
    if niveau:
        presences = presences.filter(etudiant__niveau=niveau)
    if date_str:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            presences = presences.filter(date=date_obj)
        except ValueError:
            return Response({"error": "Date format should be YYYY-MM-DD"}, status=400)

    serialized = PresenceSerializer(presences, many=True)
    total = presences.count()
    absents = presences.filter(justifiee=False).count()
    presents = total - absents
    taux = round((presents / total) * 100, 2) if total > 0 else 0

    response_data = {
        "etudiants": serialized.data,
        "statistiques": {
            "niveau": niveau,
            "presences": presents,
            "absences": absents,
            "taux": taux
        }
    }
    return Response(serialized.data)